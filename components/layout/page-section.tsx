import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PageSectionProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  testId?: string;
};

export function PageSection({
  title,
  description,
  actions,
  children,
  testId,
}: PageSectionProps) {
  return (
    <Card className="border-border/80 shadow-sm" data-testid={testId}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1 max-w-2xl">{description}</CardDescription>
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
