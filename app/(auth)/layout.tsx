import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-10">
      {/* Animated Mesh Gradients (ADR 0005) */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[50vh] w-[50vw] animate-mesh-1 rounded-full bg-violet-400/30 blur-[120px] mix-blend-normal dark:bg-violet-900/40" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[60vh] w-[60vw] animate-mesh-2 rounded-full bg-sky-300/30 blur-[120px] mix-blend-normal dark:bg-sky-900/40" />
      <div className="pointer-events-none absolute top-[20%] left-[30%] h-[40vh] w-[40vw] animate-mesh-3 rounded-full bg-rose-300/20 blur-[120px] mix-blend-normal dark:bg-rose-900/30" />

      {/* Floating Bento Card (ADR 0005) */}
      <div className="relative z-10 w-full max-w-[460px] animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="rounded-[2rem] border border-white/50 bg-white/60 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/40 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
