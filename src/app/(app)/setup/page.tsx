"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSetup() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Setup failed");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-12 w-12 text-brass" />
          <p className="section-mark mt-4">First watch</p>
          <CardTitle className="display-soft mt-2 text-3xl text-foreground">
            Sheepdog Setup
          </CardTitle>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            Welcome, brother. This page makes you the first admin of the
            Sheepdog Society. Once you claim this role, this page is permanently
            disabled.
          </p>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col items-center gap-2 text-olive">
              <Check className="h-8 w-8" />
              <p className="font-medium">You are now admin. Redirecting...</p>
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 border-l-2 border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                onClick={handleSetup}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Setting up..." : "Claim Admin Role"}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You must be signed in via Clerk first.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
