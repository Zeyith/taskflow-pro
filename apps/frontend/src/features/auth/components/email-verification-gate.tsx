"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EmailVerificationGateProps = {
  email: string | null | undefined;
};

const EMAIL_VERIFICATION_CODE = "1111";

function buildVerificationStorageKey(email: string): string {
  return `taskflow-pro-email-verified:${email.toLowerCase()}`;
}

export function EmailVerificationGate({
  email,
}: EmailVerificationGateProps): React.JSX.Element | null {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const storageKey = useMemo(() => {
    if (!email) {
      return null;
    }

    return buildVerificationStorageKey(email);
  }, [email]);

  useEffect(() => {
    if (!storageKey) {
      setIsVerified(true);
      return;
    }

    const storedValue = window.localStorage.getItem(storageKey);
    setIsVerified(storedValue === "true");
  }, [storageKey]);

  function handleVerify(): void {
    if (!storageKey) {
      toast.error("User email could not be found.");
      return;
    }

    if (verificationCode.trim() !== EMAIL_VERIFICATION_CODE) {
      toast.error("Invalid verification code.");
      return;
    }

    window.localStorage.setItem(storageKey, "true");
    setIsVerified(true);
    setVerificationCode("");
    toast.success("Email verified successfully.");
  }

  if (isVerified) {
    return null;
  }

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify Email
          </DialogTitle>
          <DialogDescription>
            Enter the verification code to continue using the workspace. Demo
            code: <span className="font-semibold text-foreground">1111</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            {email ? (
              <>
                Verification is required for{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              "Verification is required for this account."
            )}
          </div>

          <Input
            value={verificationCode}
            onChange={(event) => {
              setVerificationCode(event.target.value);
            }}
            placeholder="Enter verification code"
          />

          <Button type="button" className="w-full" onClick={handleVerify}>
            Verify Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
