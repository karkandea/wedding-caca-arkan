"use client";

import Image, { type ImageProps } from "next/image";
import { type ImgHTMLAttributes, type SourceHTMLAttributes, useState } from "react";

type ShimmerImageProps = ImageProps & {
  shimmerClassName?: string;
  showShimmer?: boolean;
};

export function ShimmerImage({ className, shimmerClassName, showShimmer = true, onLoad, alt = "", ...props }: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        {...props}
        alt={alt}
        className={className}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
      {showShimmer && !loaded && <span className={`image-load-shimmer ${shimmerClassName ?? ""}`} aria-hidden="true" />}
    </>
  );
}

type ShimmerPictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  sources?: SourceHTMLAttributes<HTMLSourceElement>[];
  shimmerClassName?: string;
};

export function ShimmerPicture({ sources = [], shimmerClassName, onLoad, alt = "", ...props }: ShimmerPictureProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <picture>
        {sources.map((source, index) => (
          <source key={`${source.srcSet ?? ""}-${index}`} {...source} />
        ))}
        <img
          {...props}
          alt={alt}
          onLoad={(event) => {
            setLoaded(true);
            onLoad?.(event);
          }}
        />
      </picture>
      {!loaded && <span className={`image-load-shimmer ${shimmerClassName ?? ""}`} aria-hidden="true" />}
    </>
  );
}
