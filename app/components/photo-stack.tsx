import { motion } from "framer-motion";

type PhotoStackProps = {
  photos: [string, string, string]; // exactly 3 image URLs
  heroReady: boolean;
  className?: string;
};

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

export default function PhotoStack({
  photos,
  heroReady,
  className,
}: PhotoStackProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible", // critical — right photo must bleed past edge
      }}
    >
      {/* Photo Left */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "18vw",
          width: "220px",
          zIndex: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -120, rotate: -18 }}
          animate={heroReady ? { opacity: 1, x: 0, rotate: -12 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          style={{
            backgroundColor: "white",
            padding: "7px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ aspectRatio: "2/3", overflow: "hidden" }}>
            <img
              src={photos[0]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt=""
            />
          </div>
        </motion.div>
      </div>

      {/* Photo Center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          marginTop: "-170px",
          marginLeft: "-120px",
          width: "240px",
          zIndex: 30,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={heroReady ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.85, ease: EASE, delay: 0.25 }}
          style={{
            backgroundColor: "white",
            padding: "7px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ aspectRatio: "2/3", overflow: "hidden" }}>
            <img
              src={photos[1]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt=""
            />
          </div>
        </motion.div>
      </div>

      {/* Photo Right */}
      <div
        style={{
          position: "absolute",
          top: "32vh",
          right: "-50px",
          width: "210px",
          zIndex: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 100, rotate: 14 }}
          animate={heroReady ? { opacity: 1, x: 0, rotate: 8 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          style={{
            backgroundColor: "white",
            padding: "7px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ aspectRatio: "2/3", overflow: "hidden" }}>
            <img
              src={photos[2]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt=""
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
