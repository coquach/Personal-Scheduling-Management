import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-[1.85rem] leading-[1.04] font-bold tracking-[-0.045em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[0.95rem] leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
