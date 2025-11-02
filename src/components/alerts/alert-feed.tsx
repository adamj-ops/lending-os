'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { IconBell, IconCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import { formatDistanceToNow } from 'date-fns';
import { useAlerts, useMarkAlertAsRead } from '@/hooks/useAlerts';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorState } from '@/components/shared/error-state';
import type { Alert } from '@/db/schema/alerts';

interface AlertItemProps {
  alert: Alert;
  onMarkRead: (alertId: string) => void;
}

function AlertItem({ alert, onMarkRead }: AlertItemProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return IconAlertCircle;
      case 'warning':
        return IconAlertTriangle;
      case 'info':
      default:
        return IconInfoCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const Icon = getSeverityIcon(alert.severity);
  const colorClass = getSeverityColor(alert.severity);

  return (
    <div className={`p-3 hover:bg-muted/50 rounded-lg transition-colors ${alert.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
              {alert.code.replace(/_/g, ' ')}
            </Badge>
            {alert.status === 'unread' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(alert.id);
                }}
              >
                <IconCheck size={20} stroke={2} className="h-3 w-3 mr-1" />
                Mark Read
              </Button>
            )}
          </div>
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {alert.entityType}: {alert.entityId.slice(0, 8)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AlertFeedProps {
  refreshInterval?: number; // How often to poll for new alerts (ms)
}

export function AlertFeed({ refreshInterval = 30000 }: AlertFeedProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use custom hook with polling support
  const { data: alerts = [], isLoading, error } = useAlerts({
    status: 'unread',
    limit: 20,
    refetchInterval: refreshInterval,
  });

  // Use mutation hook for marking alerts as read (has optimistic updates)
  const markAsReadMutation = useMarkAlertAsRead();

  const handleMarkAsRead = async (alertId: string) => {
    markAsReadMutation.mutate(alertId);
  };

  const unreadCount = alerts.filter(a => a.status === 'unread').length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell size={20} stroke={2} className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Alerts</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alerts</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && alerts.length === 0 && (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4">
            <ErrorState 
              title="Failed to load alerts"
              message={error instanceof Error ? error.message : 'Unknown error'}
              showCard={false}
            />
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div className="p-8 text-center">
            <IconBell size={20} stroke={2} className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No alerts</p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        )}

        {!error && alerts.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-1">
              {alerts.map(alert => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert}
                  onMarkRead={handleMarkAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {alerts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Navigate to full alerts page (to be created in future)
                  setIsOpen(false);
                }}
              >
                View All Alerts
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

