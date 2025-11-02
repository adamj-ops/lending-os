"use client";

import React, { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconCalendar, IconClock, IconCurrencyDollar, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  type: 'payment' | 'draw' | 'inspection' | 'deadline';
  status?: 'pending' | 'completed' | 'overdue' | 'cancelled';
  amount?: number;
  description?: string;
  loanId?: string;
  drawId?: string;
  inspectionId?: string;
  color?: string;
}

interface PaymentDrawCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  className?: string;
}

export function PaymentDrawCalendar({
  events,
  onEventClick,
  onDateSelect,
  onEventDrop,
  className
}: PaymentDrawCalendarProps) {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(event => event.type === filterType);
  }, [events, filterType]);

  const eventSources = useMemo(() => {
    const eventsByType = {
      payment: filteredEvents.filter(e => e.type === 'payment'),
      draw: filteredEvents.filter(e => e.type === 'draw'),
      inspection: filteredEvents.filter(e => e.type === 'inspection'),
      deadline: filteredEvents.filter(e => e.type === 'deadline')
    };

    return [
      {
        events: eventsByType.payment,
        color: '#3b82f6', // blue
        textColor: 'white'
      },
      {
        events: eventsByType.draw,
        color: '#10b981', // green
        textColor: 'white'
      },
      {
        events: eventsByType.inspection,
        color: '#f59e0b', // yellow
        textColor: 'white'
      },
      {
        events: eventsByType.deadline,
        color: '#ef4444', // red
        textColor: 'white'
      }
    ];
  }, [filteredEvents]);

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event && onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const event = events.find(e => e.id === dropInfo.event.id);
    if (event && onEventDrop) {
      onEventDrop(event, dropInfo.event.start);
    }
  };

  const getEventContent = (eventInfo: any) => {
    const event = events.find(e => e.id === eventInfo.event.id);
    if (!event) return null;

    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{event.title}</div>
        {event.amount && (
          <div className="flex items-center gap-1">
            <IconCurrencyDollar size={20} stroke={2} className="h-3 w-3" />
            <span>{event.amount.toLocaleString()}</span>
          </div>
        )}
        {event.status && (
          <div className="flex items-center gap-1 mt-1">
            {event.status === 'completed' && <IconCircleCheck size={20} stroke={2} className="h-3 w-3 text-green-500" />}
            {event.status === 'overdue' && <IconAlertCircle size={20} stroke={2} className="h-3 w-3 text-red-500" />}
            <span className="capitalize">{event.status}</span>
          </div>
        )}
      </div>
    );
  };

  const eventStats = useMemo(() => {
    const stats = {
      total: events.length,
      payments: events.filter(e => e.type === 'payment').length,
      draws: events.filter(e => e.type === 'draw').length,
      inspections: events.filter(e => e.type === 'inspection').length,
      deadlines: events.filter(e => e.type === 'deadline').length,
      pending: events.filter(e => e.status === 'pending').length,
      completed: events.filter(e => e.status === 'completed').length,
      overdue: events.filter(e => e.status === 'overdue').length
    };

    return stats;
  }, [events]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Payment & Draw Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(value: any) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="draw">Draws</SelectItem>
                  <SelectItem value="inspection">Inspections</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Event Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{eventStats.payments}</div>
              <div className="text-sm text-gray-600">Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{eventStats.draws}</div>
              <div className="text-sm text-gray-600">Draws</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{eventStats.inspections}</div>
              <div className="text-sm text-gray-600">Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{eventStats.deadlines}</div>
              <div className="text-sm text-gray-600">Deadlines</div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <IconClock size={20} stroke={2} className="h-3 w-3" />
              {eventStats.pending} Pending
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconCircleCheck size={20} stroke={2} className="h-3 w-3" />
              {eventStats.completed} Completed
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconAlertCircle size={20} stroke={2} className="h-3 w-3" />
              {eventStats.overdue} Overdue
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            eventSources={eventSources}
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventContent={getEventContent}
            height="auto"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventDisplay="block"
            selectable={true}
            selectMirror={true}
            editable={true}
            droppable={true}
            eventResizableFromStart={true}
            eventDurationEditable={true}
            eventStartEditable={true}
            weekends={true}
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '09:00',
              endTime: '17:00'
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            expandRows={true}
            aspectRatio={1.8}
          />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for event details modal
interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onComplete?: (event: CalendarEvent) => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onComplete
}: EventDetailsModalProps) {
  if (!event || !isOpen) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />;
      case 'draw': return <IconCalendar size={20} stroke={2} className="h-4 w-4" />;
      case 'inspection': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />;
      case 'deadline': return <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />;
      default: return <IconCalendar size={20} stroke={2} className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(event.type)}
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconCalendar size={20} stroke={2} className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {new Date(event.start).toLocaleDateString()}
                {event.end && ` - ${new Date(event.end).toLocaleDateString()}`}
              </span>
            </div>
            
            {event.amount && (
              <div className="flex items-center gap-2">
                <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  ${event.amount.toLocaleString()}
                </span>
              </div>
            )}
            
            {event.status && (
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            )}
            
            {event.description && (
              <div className="text-sm text-gray-600">
                {event.description}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(event)}>
                Edit
              </Button>
            )}
            {onComplete && event.status !== 'completed' && (
              <Button onClick={() => onComplete(event)}>
                Mark Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
