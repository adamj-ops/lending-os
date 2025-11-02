"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";

interface SignatureStatusCardProps {
  signatureId: string;
  status: "draft" | "sent" | "viewed" | "signed" | "completed" | "declined" | "voided";
  documentType: string;
  signers: Array<{ email: string; name: string; status: string }>;
  sentAt?: Date | null;
  completedAt?: Date | null;
}

export function SignatureStatusCard({
  signatureId,
  status,
  documentType,
  signers,
  sentAt,
  completedAt,
}: SignatureStatusCardProps) {
  const statusConfig = {
    draft: { label: "Draft", variant: "secondary" as const, icon: IconClock },
    sent: { label: "Sent", variant: "default" as const, icon: IconClock },
    viewed: { label: "Viewed", variant: "default" as const, icon: IconClock },
    signed: { label: "Signed", variant: "default" as const, icon: IconCheck },
    completed: { label: "Completed", variant: "default" as const, icon: IconCheck },
    declined: { label: "Declined", variant: "destructive" as const, icon: IconX },
    voided: { label: "Voided", variant: "secondary" as const, icon: IconX },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{documentType}</CardTitle>
          <Badge variant={config.variant}>
            <StatusIcon size={14} className="mr-1" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>Signature ID: {signatureId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Signers</p>
            <div className="space-y-2">
              {signers.map((signer, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{signer.name || signer.email}</span>
                  <Badge variant={signer.status === "signed" ? "default" : "secondary"} size="sm">
                    {signer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          {sentAt && (
            <div className="text-sm text-muted-foreground">
              Sent: {new Date(sentAt).toLocaleDateString()}
            </div>
          )}
          {completedAt && (
            <div className="text-sm text-muted-foreground">
              Completed: {new Date(completedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


