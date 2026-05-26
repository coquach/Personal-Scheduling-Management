import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageSection({
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      {actions ? (
        <div className="flex w-full justify-end">
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      ) : null}
      {children}
    </section>
  );
}
