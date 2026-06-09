"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      aria-label="Kembali ke halaman sebelumnya"
      className="fixed left-4 top-4 z-[950] flex h-11 w-11 items-center justify-center rounded-full border border-[#2B241D]/10 bg-[#FFF8F5]/88 text-[#2B241D] shadow-[0_10px_28px_rgba(43,36,29,0.14)] backdrop-blur-[14px] transition hover:-translate-y-0.5 hover:bg-[#FFFCF5] active:translate-y-0 sm:left-6 sm:top-6 sm:h-12 sm:w-12"
    >
      <ArrowLeft size={21} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
