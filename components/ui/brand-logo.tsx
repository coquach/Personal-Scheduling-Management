import { CalendarDaysIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
};

export function BrandLogo({ className, size = "md", hideText = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm",
          {
            "size-8 rounded-lg": size === "sm",
            "size-10": size === "md",
            "size-12 rounded-2xl": size === "lg",
          }
        )}
      >
        <CalendarDaysIcon
          className={cn({
            "size-4": size === "sm",
            "size-5": size === "md",
            "size-6": size === "lg",
          })}
        />
      </div>
      {!hideText && (
        <div className="flex flex-col justify-center -space-y-0.5">
          <p
            className={cn("font-bold tracking-tight text-foreground", {
              "text-sm": size === "sm",
              "text-base": size === "md",
              "text-lg": size === "lg",
            })}
          >
            PSMS
          </p>
          <p
            className={cn("font-medium text-muted-foreground", {
              "text-[10px]": size === "sm",
              "text-xs": size === "md",
              "text-sm": size === "lg",
            })}
          >
            Workspace
          </p>
        </div>
      )}
    </div>
  );
}
