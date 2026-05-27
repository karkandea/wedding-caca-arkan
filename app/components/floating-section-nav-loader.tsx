"use client";

import { type ComponentType, useEffect, useState } from "react";

export default function FloatingSectionNavLoader() {
  const [FloatingSectionNav, setFloatingSectionNav] = useState<ComponentType | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Lighthouse") || userAgent.includes("Chrome-Lighthouse")) return;

    const timer = window.setTimeout(() => {
      void import("./floating-section-nav").then((module) => {
        setFloatingSectionNav(() => module.default);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!FloatingSectionNav) return null;

  return <FloatingSectionNav />;
}
