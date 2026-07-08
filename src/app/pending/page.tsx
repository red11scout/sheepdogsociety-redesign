import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Shield className="h-12 w-12 text-brass" />
          <p className="section-mark">The gate</p>
          <h1 className="display-soft text-3xl text-foreground">
            Awaiting Approval
          </h1>
          <div className="hairline w-16 self-center text-foreground" />
          <p className="font-serif text-base leading-relaxed text-muted-foreground">
            Your registration is being reviewed. You will receive an email once
            approved. Stand fast.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
