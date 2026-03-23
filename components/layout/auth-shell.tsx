import { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.16),_transparent_42%),linear-gradient(180deg,_#f8fafc,_#e2e8f0)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/60 bg-slate-950 px-6 py-8 text-slate-50 shadow-2xl shadow-cyan-950/10 sm:px-10 sm:py-12">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-200">
              Personal Scheduling Management System
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {description}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">4</p>
                <p className="mt-1 text-sm text-slate-300">Calendar modes</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">3</p>
                <p className="mt-1 text-sm text-slate-300">Reminder actions</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">100%</p>
                <p className="mt-1 text-sm text-slate-300">Mock-first testing</p>
              </div>
            </div>
          </section>
          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
