"use client";

import Image, { type ImageProps } from "next/image";
import { type ImgHTMLAttributes, type SourceHTMLAttributes, useState } from "react";

type ShimmerImageProps = ImageProps & {
  shimmerClassName?: string;
};

export function ShimmerImage({ className, shimmerClassName, onLoad, ...props }: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        {...props}
        className={className}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
      {!loaded && <span className={`image-load-shimmer ${shimmerClassName ?? ""}`} aria-hidden="true" />}
    </>
  );
}

type ShimmerPictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  sources?: SourceHTMLAttributes<HTMLSourceElement>[];
  shimmerClassName?: string;
};

export function ShimmerPicture({ sources = [], shimmerClassName, onLoad, ...props }: ShimmerPictureProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <picture>
        {sources.map((source, index) => (
          <source key={`${source.srcSet ?? ""}-${index}`} {...source} />
        ))}
        <img
          {...props}
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
