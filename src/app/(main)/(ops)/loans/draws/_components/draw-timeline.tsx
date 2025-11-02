"use client";

import { format, formatDistanceToNow } from "date-fns";
import { IconFileText, IconSend, IconEye, IconCalendar, IconCircleCheck, IconX, IconCurrencyDollar, IconMessage, IconUser, IconClock } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  type:
    | "created"
    | "submitted"
    | "under_review"
    | "inspection_scheduled"
    | "inspection_completed"
    | "approved"
    | "rejected"
    | "disbursed"
    | "comment";
  timestamp: Date | string;
  actorName: string;
  actorRole?: string;
  title: string;
  description?: string;
  metadata?: {
    amount?: number;
    inspectionDate?: Date | string;
    approvedAmount?: number;
    rejectionReason?: string;
    comment?: string;
  };
}

interface DrawTimelineProps {
  drawId: string;
  events: TimelineEvent[];
  currentStatus: string;
}

const eventConfig = {
  created: {
    icon: IconFileText,
  },
  submitted: {
    icon: IconSend,
  },
  under_review: {
    icon: IconEye,
  },
  inspection_scheduled: {
    icon: IconCalendar,
  },
  inspection_completed: {
    icon: IconCircleCheck,
  },
  approved: {
    icon: IconCircleCheck,
  },
  rejected: {
    icon: IconX,
  },
  disbursed: {
    icon: IconCurrencyDollar,
  },
  comment: {
    icon: IconMessage,
  },
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-muted text-foreground",
  under_review: "bg-muted text-foreground",
  inspection_scheduled: "bg-muted text-foreground",
  inspection_complete: "bg-muted text-foreground",
  approved: "bg-muted text-foreground",
  rejected: "bg-muted text-foreground",
  disbursed: "bg-muted text-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function DrawTimeline({
  drawId,
  events,
  currentStatus,
}: DrawTimelineProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Draw Timeline</CardTitle>
            <CardDescription>
              Complete history of this draw request
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={statusColors[currentStatus] || statusColors.draft}
          >
            {currentStatus.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />

          {events.map((event, index) => {
            const config = eventConfig[event.type] || eventConfig.comment;
            const Icon = config.icon;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card"
                >
                  <Icon size={20} stroke={2} className="text-foreground" />
                </div>

                {/* Content */}
                <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}

                      {/* Event Metadata */}
                      {event.metadata && (
                        <div className="mt-2 space-y-1">
                          {event.metadata.amount && (
                            <div className="flex items-center gap-2 text-sm">
                              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Amount: $
                                {event.metadata.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}

                          {event.metadata.approvedAmount && (
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
                              <span>
                                Approved: $
                                {event.metadata.approvedAmount.toLocaleString(
                                  "en-US",
                                  { minimumFractionDigits: 2 }
                                )}
                              </span>
                            </div>
                          )}

                          {event.metadata.inspectionDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <IconCalendar size={20} stroke={2} className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Scheduled:{" "}
                                {format(
                                  new Date(event.metadata.inspectionDate),
                                  "PPP"
                                )}
                              </span>
                            </div>
                          )}

                          {event.metadata.rejectionReason && (
                            <div className="mt-2 rounded-lg border border-border bg-muted p-3 text-sm">
                              <p className="font-medium text-foreground">
                                Rejection Reason:
                              </p>
                              <p className="text-muted-foreground">
                                {event.metadata.rejectionReason}
                              </p>
                            </div>
                          )}

                          {event.metadata.comment && (
                            <div className="mt-2 rounded-lg border bg-muted p-3 text-sm">
                              {event.metadata.comment}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actor Info */}
                      <div className="mt-2 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(event.actorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="font-medium">{event.actorName}</span>
                          {event.actorRole && (
                            <>
                              <span>•</span>
                              <span>{event.actorRole}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconClock size={20} stroke={2} className="h-3 w-3" />
                        <span>
                          {format(new Date(event.timestamp), "PPP 'at' p")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconFileText size={20} stroke={2} className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No timeline events yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* Example Timeline Events Structure:

const exampleEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "created",
    timestamp: new Date("2025-10-20T10:00:00"),
    actorName: "John Borrower",
    actorRole: "Borrower",
    title: "Draw Request Created",
    description: "Initial draw request created as draft",
  },
  {
    id: "2",
    type: "submitted",
    timestamp: new Date("2025-10-20T14:30:00"),
    actorName: "John Borrower",
    actorRole: "Borrower",
    title: "Draw Request Submitted",
    description: "Draw request submitted for review",
    metadata: {
      amount: 50000,
    },
  },
  {
    id: "3",
    type: "under_review",
    timestamp: new Date("2025-10-21T09:00:00"),
    actorName: "Sarah Lender",
    actorRole: "Loan Officer",
    title: "Review Started",
    description: "Draw request is under review",
  },
  {
    id: "4",
    type: "inspection_scheduled",
    timestamp: new Date("2025-10-21T11:00:00"),
    actorName: "Sarah Lender",
    actorRole: "Loan Officer",
    title: "Inspection Scheduled",
    description: "On-site inspection has been scheduled",
    metadata: {
      inspectionDate: new Date("2025-10-25T10:00:00"),
    },
  },
  {
    id: "5",
    type: "comment",
    timestamp: new Date("2025-10-23T15:00:00"),
    actorName: "Mike Inspector",
    actorRole: "Inspector",
    title: "Comment Added",
    metadata: {
      comment: "Preliminary review looks good. Will confirm on inspection day.",
    },
  },
  {
    id: "6",
    type: "inspection_completed",
    timestamp: new Date("2025-10-25T14:00:00"),
    actorName: "Mike Inspector",
    actorRole: "Inspector",
    title: "Inspection Completed",
    description: "On-site inspection has been completed successfully",
  },
  {
    id: "7",
    type: "approved",
    timestamp: new Date("2025-10-26T10:00:00"),
    actorName: "Sarah Lender",
    actorRole: "Loan Officer",
    title: "Draw Approved",
    description: "Draw request has been approved",
    metadata: {
      approvedAmount: 50000,
    },
  },
  {
    id: "8",
    type: "disbursed",
    timestamp: new Date("2025-10-26T16:00:00"),
    actorName: "Finance Team",
    actorRole: "Finance",
    title: "Funds Disbursed",
    description: "Funds have been disbursed via wire transfer",
    metadata: {
      amount: 50000,
    },
  },
];

*/
