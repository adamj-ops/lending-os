# Sprint 4 Phase 2: Advanced Analytics Features - User Guide

## Quick Start

This guide explains how to use the new advanced analytics features in Lending OS.

---

## 1. Analytics Filtering

### Accessing Filters

Navigate to any domain-specific analytics page:
- `/analytics/loans` - Loan Portfolio Analytics
- `/analytics/collections` - Payment Collections Analytics
- `/analytics/inspections` - Field Inspections Analytics

### Using the Filter Panel

The filter panel appears at the top of each analytics page:

**Date Range:**
1. Click "Start date" button
2. Select a date from the calendar
3. Click "End date" button
4. Select a date from the calendar

**Loan Filter:**
1. Click "Select loans" button
2. Check boxes next to loans you want to include
3. Selected loans appear as badges below the dropdown

**Property Filter:**
1. Click "Select properties" button
2. Check boxes next to properties you want to include
3. Selected properties appear as badges below the dropdown

**Status Filter:**
1. Click "Select status" button
2. Check status types to include (active, delinquent, completed, cancelled)
3. Selected statuses appear as badges below the dropdown

**Applying Filters:**
- Click "Apply" to fetch filtered data
- The active filter count appears as a badge next to "Filters"
- Charts and KPIs update to reflect filtered dataset

**Resetting Filters:**
- Click "Reset" to clear all filters
- Data returns to default view (last 30 days, all loans)

### Removing Individual Filters

- Click the "X" icon on any filter badge to remove that specific filter
- Other filters remain active
- Click "Apply" to update data after removing a filter

---

## 2. Real-Time Event Monitoring

### Recent Events Widget

Located on the Analytics Overview page (`/analytics`):

**Features:**
- Displays the last 100 domain events
- Auto-updates every 60 seconds
- Color-coded by event type (green = success, red = error, blue = info)
- Shows relative timestamps ("2 minutes ago")

**Manual Refresh:**
- Click the refresh icon (circular arrow) in the widget header
- Useful for immediately checking for new events without waiting for auto-update

**Event Types Displayed:**
- Payment events (received, late, failed)
- Draw events (approved, rejected, status changed)
- Inspection events (scheduled, completed, due, overdue)
- Loan events (funded, delinquent)

---

## 3. In-App Alerts

### Alert Bell Icon

Located in the dashboard header (top-right, next to theme switcher):

**Unread Badge:**
- Red badge shows count of unread alerts
- Displays "9+" if more than 9 unread alerts
- Badge disappears when all alerts are read

**Opening Alert Feed:**
1. Click the bell icon
2. Dropdown opens showing recent alerts (scrollable)
3. Auto-refreshes every 30 seconds
4. Also refreshes when dropdown is opened

### Alert Types

**Payment Alerts:**
- **PAYMENT_LATE (Warning):** Payment is overdue
- **PAYMENT_FAILED (Critical):** Payment processing failed

**Draw Alerts:**
- **DRAW_STATUS_CHANGED (Info):** Draw request status updated
- **DRAW_APPROVED (Info):** Draw request approved
- **DRAW_REJECTED (Warning):** Draw request rejected

**Inspection Alerts:**
- **INSPECTION_DUE (Warning):** Inspection due within 24 hours
- **INSPECTION_OVERDUE (Critical):** Inspection is overdue

**Loan Alerts:**
- **LOAN_DELINQUENT (Critical):** Loan has become delinquent

### Managing Alerts

**Marking as Read:**
1. Click "Mark Read" button on any unread alert
2. Alert status changes to "read"
3. Alert remains in feed but no longer counts toward unread badge

**Alert Details:**
- Each alert shows: code, message, entity type, entity ID (shortened), and timestamp
- Color-coded severity indicators (blue = info, yellow = warning, red = critical)

---

## 4. CSV Data Export

### Exporting Analytics Data

Available on all domain-specific analytics pages:

1. Navigate to `/analytics/loans`, `/analytics/collections`, or `/analytics/inspections`
2. Apply any desired filters
3. Click "Export CSV" button in top-right
4. CSV file downloads automatically with date-stamped filename

**Export Contents:**
- All data points currently displayed in the timeline/series
- Includes all columns from the analytics snapshot
- Properly formatted for Excel/Google Sheets
- Date included in filename for organization

---

## 5. Drill-Down Analysis (Future Enhancement)

The DrillDownModal component is ready for integration. Future updates will enable:
- Clicking on chart data points to view detailed entity information
- Clicking on table rows to open detailed entity views
- Historical trend mini-charts within the modal
- Related records and dependencies display

**Current Status:** Component implemented, integration points ready for connection

---

## Technical Details for Developers

### Filter Query Parameters

When filters are applied, the following query parameters are sent to analytics APIs:

```
/api/v1/loans/analytics?start=2025-01-01&end=2025-01-31&loanIds=uuid1,uuid2&propertyIds=uuid3&statuses=active,funded
```

### Event Polling Behavior

- **Default Interval:** 60 seconds
- **Configurable:** Pass `interval` prop to `RecentEventsWidget`
- **Memory Management:** Keeps last 100 events in memory
- **Incremental Updates:** Uses `since` timestamp to fetch only new events

### Alert Auto-Generation

Alerts are automatically created when domain events are published:

1. Domain event published to event bus (e.g., `Payment.Late`)
2. Alert handler intercepts event
3. AlertService.handleEvent() creates alert record
4. Alert appears in AlertFeed within 30 seconds

**Event Bus Registration:** Alert handlers are auto-registered on app startup via `src/lib/events/init.ts`

---

## Troubleshooting

### Filters Not Working
- Ensure "Apply" button is clicked after selecting filters
- Check browser console for API errors
- Verify filter selections are showing as badges

### Alerts Not Appearing
- Check that alert table migration has run (`npm run db:migrate`)
- Verify event handlers are registered (check server logs for "Event handlers registered successfully (including 8 alert handlers)")
- Ensure domain events are being published

### Events Not Updating
- Check `/api/v1/events/recent` endpoint is accessible
- Verify browser console for polling errors
- Check Network tab for API requests every 60s

### CSV Export Not Working
- Ensure data has loaded before clicking export
- Check browser's download settings
- Verify no popup blockers are interfering

---

## Performance Considerations

### Polling Frequency
- Default 60s for events, 30s for alerts is optimized for balance between real-time feel and server load
- Can be adjusted via component props if needed
- Consider increasing interval if experiencing performance issues

### Filter Performance
- Complex filters (multiple loans + properties + statuses) may take longer to process
- Snapshot tables are optimized for date range queries
- Consider using date filters for best performance

### CSV Export Limits
- Client-side export handles datasets up to ~10,000 rows efficiently
- For larger datasets, server-side generation will be added in future sprint
- Browser memory limitations may affect very large exports

---

## Future Enhancements (Sprint 5+)

1. **Email Notifications**
   - Configure email delivery for critical alerts
   - User preference settings for notification types
   - Email templates for each alert type

2. **Advanced Drill-Down**
   - Click-to-drill on charts and tables
   - Comparative analysis views
   - Historical trend visualization

3. **Custom Dashboards**
   - Drag-and-drop dashboard builder
   - Save custom filter presets
   - Personalized KPI selections

4. **Real-Time Charts**
   - Live-updating chart data
   - WebSocket-based updates
   - Streaming data visualization

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Sprint:** 4 Phase 2

