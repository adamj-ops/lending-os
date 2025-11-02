'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IconActivity, IconRefresh, IconCurrencyDollar, IconFileText, IconClipboardCheck } from "@tabler/icons-react";
import { useEventPolling, type DomainEvent } from '@/hooks/useEventPolling';
import { formatDistanceToNow } from 'date-fns';

interface EventItemProps {
  event: DomainEvent;
}

function EventItem({ event }: EventItemProps) {
  const getEventIcon = (eventType: string) => {
    if (eventType.startsWith('Payment')) return IconCurrencyDollar;
    if (eventType.startsWith('Draw')) return IconFileText;
    if (eventType.startsWith('Inspection')) return IconClipboardCheck;
    return IconActivity;
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('Late') || eventType.includes('Failed')) return 'text-red-600';
    if (eventType.includes('Completed') || eventType.includes('Received')) return 'text-green-600';
    if (eventType.includes('Pending') || eventType.includes('Scheduled')) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getEventBadgeVariant = (eventType: string): "success" | "secondary" | "destructive" | "outline" => {
    if (eventType.includes('Late') || eventType.includes('Failed')) return 'destructive';
    if (eventType.includes('Completed') || eventType.includes('Received')) return 'success';
    if (eventType.includes('Pending') || eventType.includes('Scheduled')) return 'secondary';
    return 'outline';
  };

  const Icon = getEventIcon(event.eventType);
  const colorClass = getEventColor(event.eventType);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={`mt-0.5 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{event.eventType}</p>
          <Badge variant={getEventBadgeVariant(event.eventType)} className="text-xs">
            {event.domain || 'System'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {event.aggregateType && event.aggregateId && (
            <span className="capitalize">{event.aggregateType}: {event.aggregateId.slice(0, 8)}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

interface RecentEventsWidgetProps {
  interval?: number; // Polling interval in milliseconds
  limit?: number; // Number of events to fetch
}

export function RecentEventsWidget({ interval = 60000, limit = 20 }: RecentEventsWidgetProps) {
  const { events, isPolling, error, refresh, lastPoll } = useEventPolling({ interval, limit });

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <IconActivity size={20} stroke={2} className="h-5 w-5" />
              Recent Events
            </CardTitle>
            {events.length > 0 && (
              <Badge variant="secondary">{events.length}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isPolling}
            className="h-8 w-8"
          >
            <IconRefresh size={20} stroke={2} className={`h-4 w-4 ${isPolling ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Real-time domain events (polling every {interval / 1000}s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 border border-red-600 rounded-lg bg-transparent dark:border-red-400">
            <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {!error && events.length === 0 && !isPolling && (
          <div className="p-8 text-center">
            <IconActivity size={20} stroke={2} className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Events will appear here as they occur
            </p>
          </div>
        )}

        {!error && (events.length > 0 || isPolling) && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {isPolling && events.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                events.map(event => (
                  <EventItem key={event.id} event={event} />
                ))
              )}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {formatDistanceToNow(new Date(lastPoll), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

