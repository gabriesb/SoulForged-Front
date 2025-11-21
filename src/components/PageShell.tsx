import React from "react";
import TopBar from "./TopBar";
import { bg } from "./Neon";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bg} min-h-screen text-white`}>
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
