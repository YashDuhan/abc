"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-white text-xl">Loading 3D Scene...</div>
    </div>
  ),
});

export default function Home() {
  return <Scene3D />;
}
