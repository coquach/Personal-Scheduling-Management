import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-[18px] border border-border bg-card p-6 shadow-[0_14px_34px_rgba(60,64,67,0.1)] sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
