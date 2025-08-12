"use client";

import React from "react";
import { MenuProvider } from "./components/MenuContext";

export default function Rootlayout({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      {children}
    </MenuProvider>
  );
}
