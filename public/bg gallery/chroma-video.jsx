// chroma-video.jsx — GPU chroma-key video using WebGL.
//
// Why this is fast:
//   • All per-pixel keying happens in a fragment shader on the GPU.
//     Even a 1080p frame is a single draw call.
//   • Uses requestVideoFrameCallback() — the browser only schedules a
//     redraw when a NEW video frame is decoded. If the tab is hidden
//     or the video is paused, we draw nothing. (Falls back to rAF
//     only on older browsers.)
//   • Texture is reused across frames; we only call texImage2D when a
//     new frame arrives.
//   • Canvas keeps its intrinsic video resolution so we never upscale
//     in JS — the browser scales the canvas at composite time on the GPU.
//
// Chroma key uses YCbCr distance (better than RGB Euclidean — anti-aliased
// edges and spill stay clean), with a soft band controlled by `smoothness`.

const VS = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FS = `
  precision mediump float;
  uniform sampler2D u_tex;
  uniform vec3  u_key;        // chroma key colour in 0..1
  uniform float u_similarity; // 0..1 — bigger = remove more
  uniform float u_smoothness; // 0..1 — soft edge band
  uniform float u_spill;      // 0..1 — desaturate residual key
  varying vec2 v_uv;

  // BT.601 chroma — fast and great for keying
  vec2 rgbToCC(vec3 rgb) {
    float y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    return vec2((rgb.b - y) * 0.565, (rgb.r - y) * 0.713);
  }

  void main() {
    vec4 c = texture2D(u_tex, v_uv);
    vec2 ck = rgbToCC(u_key);
    vec2 cf = rgbToCC(c.rgb);
    float d = distance(ck, cf);
    // mask: 0 = key colour (transparent), 1 = keep
    float mask = smoothstep(u_similarity, u_similarity + u_smoothness, d);

    // Spill suppression: desaturate pixels close to the key colour
    float spillMask = 1.0 - smoothstep(u_similarity, u_similarity + u_smoothness * 4.0, d);
    float luma = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    vec3 desat = mix(c.rgb, vec3(luma), spillMask * u_spill);

    gl_FragColor = vec4(desat * mask, mask);
  }
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function buildProgram(gl) {
  const vs = compile(gl, gl.VERTEX_SHADER, VS);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('link:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function ChromaVideo({
  src,
  keyColor = '#00ff00',
  similarity = 0.42,
  smoothness = 0.1,
  spill = 0.45,
  width = 320,
  height = 320,
  className = '',
  style = {},
}) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({ gl: null, prog: null, tex: null, locs: null });

  // Setup once
  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const gl = canvas.getContext('webgl', {
      premultipliedAlpha: false,
      alpha: true,
      antialias: false,
    });
    if (!gl) {
      console.warn('WebGL not available — chroma key disabled');
      return;
    }

    const prog = buildProgram(gl);
    if (!prog) return;
    gl.useProgram(prog);

    // fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    stateRef.current = {
      gl, prog, tex,
      locs: {
        u_tex: gl.getUniformLocation(prog, 'u_tex'),
        u_key: gl.getUniformLocation(prog, 'u_key'),
        u_sim: gl.getUniformLocation(prog, 'u_similarity'),
        u_smo: gl.getUniformLocation(prog, 'u_smoothness'),
        u_spill: gl.getUniformLocation(prog, 'u_spill'),
      },
    };
    gl.uniform1i(stateRef.current.locs.u_tex, 0);
  }, []);

  // Sync uniforms when chroma params change
  React.useEffect(() => {
    const s = stateRef.current;
    if (!s.gl) return;
    s.gl.useProgram(s.prog);
    const [r, g, b] = hexToRgb01(keyColor);
    s.gl.uniform3f(s.locs.u_key, r, g, b);
    s.gl.uniform1f(s.locs.u_sim, similarity);
    s.gl.uniform1f(s.locs.u_smo, smoothness);
    s.gl.uniform1f(s.locs.u_spill, spill);
  }, [keyColor, similarity, smoothness, spill]);

  // Video loop — requestVideoFrameCallback when available, rAF otherwise
  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let stopped = false;
    let rafId = 0;

    const draw = () => {
      const s = stateRef.current;
      if (stopped || !s.gl) return;
      const { gl, tex } = s;
      // resize canvas to actual video dimensions (only on change)
      if (video.videoWidth && canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        } catch (e) { /* video not ready */ }
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      schedule();
    };

    const schedule = () => {
      if (stopped) return;
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(draw);
      } else {
        rafId = requestAnimationFrame(draw);
      }
    };

    const onCanPlay = () => {
      video.play().catch(() => {});
      schedule();
    };

    video.addEventListener('loadeddata', onCanPlay);
    if (video.readyState >= 2) onCanPlay();

    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      video.removeEventListener('loadeddata', onCanPlay);
    };
  }, [src]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        crossOrigin="anonymous"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

window.ChromaVideo = ChromaVideo;
