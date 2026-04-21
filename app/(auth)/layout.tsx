import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(150deg,#f8fbff_0%,#f2f7ff_48%,#eef8f9_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-[radial-gradient(circle,_rgba(26,115,232,0.2),_transparent_64%)]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-[radial-gradient(circle,_rgba(52,168,83,0.16),_transparent_66%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-[460px] rounded-[24px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_44px_rgba(60,64,67,0.18)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-500 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
