"use client";

import { createContext, useContext } from "react";

const PreloaderReadyContext = createContext(false);

export function usePreloaderReady() {
  return useContext(PreloaderReadyContext);
}

export default function PreloaderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PreloaderReadyContext.Provider value={true}>
      {children}
    </PreloaderReadyContext.Provider>
  );
}
