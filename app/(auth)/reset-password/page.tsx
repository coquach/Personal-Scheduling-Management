"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [errorVisible, setErrorVisible] = useState(false);
  const token = searchParams.get("token");

  return (
    <div data-testid="reset-password-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="px-2">
          <CardTitle className="text-[2.15rem] leading-[1.04] font-bold tracking-[-0.05em]">
            Reset password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
          <p className="text-sm leading-6 text-muted-foreground">
            Token status: <span className="font-medium text-foreground">{token ?? "missing-token"}</span>
          </p>
          <Input type="password" placeholder="New password" data-testid="reset-password-new-input" />
          <Input
            type="password"
            placeholder="Confirm password"
            data-testid="reset-password-confirm-input"
          />
          <Button className="w-full" data-testid="reset-password-submit" onClick={() => setErrorVisible(true)}>
            Update password
          </Button>
          {errorVisible ? (
            <Alert variant="destructive" data-testid="reset-password-error">
              Reset token has expired. Request a new recovery email.
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
