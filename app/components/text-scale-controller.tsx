"use client";

import { useEffect } from "react";

const TEXT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "button",
  "span",
  "li",
  "label",
  "small",
  "blockquote",
  "figcaption",
  "th",
  "td",
].join(",");

const getScale = () => {
  const savedScale = Number(window.localStorage.getItem("wedding-font-scale"));
  return Number.isFinite(savedScale) && savedScale >= 0.85 && savedScale <= 1.25 ? savedScale : 1;
};

const hasDirectText = (element: Element) =>
  Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()));

const isScalableTextElement = (element: Element) => {
  if (element.closest("svg")) return false;
  if (element.matches(TEXT_SELECTOR)) return true;
  return element.tagName === "DIV" && hasDirectText(element);
};

export default function TextScaleController() {
  useEffect(() => {
    let frameId = 0;
    let lastScale = getScale();

    const collectElements = () =>
      Array.from(document.body.querySelectorAll<HTMLElement>(`${TEXT_SELECTOR}, div`)).filter(isScalableTextElement);

    const applyScale = (recalculateBase = false) => {
      frameId = 0;
      const scale = getScale();
      document.documentElement.style.setProperty("--wedding-font-scale", String(scale));

      collectElements().forEach((element) => {
        if (recalculateBase || !element.dataset.baseFontSize) {
          const computedSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
          if (Number.isFinite(computedSize)) {
            element.dataset.baseFontSize = String(computedSize / lastScale);
          }
        }

        const baseSize = Number(element.dataset.baseFontSize);
        if (Number.isFinite(baseSize)) {
          element.style.fontSize = `${baseSize * scale}px`;
        }
      });

      lastScale = scale;
    };

    const scheduleScale = (recalculateBase = false) => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => applyScale(recalculateBase));
    };

    const observer = new MutationObserver(() => scheduleScale());
    observer.observe(document.body, { childList: true, subtree: true });

    const handleScaleChange = () => scheduleScale();
    const handleResize = () => {
      collectElements().forEach((element) => {
        element.style.fontSize = "";
        delete element.dataset.baseFontSize;
      });
      scheduleScale(true);
    };

    scheduleScale(true);
    window.addEventListener("wedding-font-scale-change", handleScaleChange);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("wedding-font-scale-change", handleScaleChange);
      window.removeEventListener("resize", handleResize);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
