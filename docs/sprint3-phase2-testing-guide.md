# Sprint 3 Phase 2 - UI Components Testing Guide

## Overview
This guide provides comprehensive testing procedures for all UI components built in Sprint 3 Phase 2, including payment management, draw requests, inspections, and workflow visualization.

## Testing Environment Setup

### Prerequisites
- Development server running (`npm run dev`)
- Database migrations applied
- API endpoints functional
- Test data seeded

### Test Data Requirements
```typescript
// Required test data for comprehensive testing
const testData = {
  loans: [
    {
      id: 'test-loan-1',
      borrowerId: 'test-borrower-1',
      lenderId: 'test-lender-1',
      amount: 500000,
      status: 'active'
    }
  ],
  payments: [
    {
      id: 'test-payment-1',
      loanId: 'test-loan-1',
      amount: 2500,
      status: 'completed',
      paymentDate: '2024-01-15'
    }
  ],
  draws: [
    {
      id: 'test-draw-1',
      loanId: 'test-loan-1',
      amountRequested: 50000,
      status: 'pending',
      description: 'Foundation work'
    }
  ],
  inspections: [
    {
      id: 'test-inspection-1',
      drawId: 'test-draw-1',
      status: 'scheduled',
      scheduledDate: '2024-01-20'
    }
  ]
};
```

## Component Testing Checklist

### 1. Payment Components Testing

#### PaymentHistoryTable
- [ ] **Data Loading**: Verify table loads payment data correctly
- [ ] **Sorting**: Test column sorting functionality
- [ ] **Filtering**: Test status and date range filters
- [ ] **Pagination**: Verify pagination works with large datasets
- [ ] **Actions**: Test payment update actions
- [ ] **Responsive**: Verify mobile responsiveness

**Test Commands:**
```bash
# Test payment history table
curl -X GET "http://localhost:3000/api/v1/loans/test-loan-1/payments"
```

#### PaymentForm
- [ ] **Form Validation**: Test all required field validation
- [ ] **Amount Input**: Test currency formatting and validation
- [ ] **Date Selection**: Test date picker functionality
- [ ] **Payment Method**: Test payment method selection
- [ ] **Submit**: Test form submission and error handling
- [ ] **Reset**: Test form reset functionality

#### PaymentSummaryCard
- [ ] **Metrics Display**: Verify all metrics display correctly
- [ ] **Status Indicators**: Test status badge colors and text
- [ ] **Action Buttons**: Test payment action buttons
- [ ] **Real-time Updates**: Test data updates after actions

### 2. Draw Components Testing

#### DrawRequestForm
- [ ] **Form Validation**: Test all required field validation
- [ ] **Amount Input**: Test amount validation and formatting
- [ ] **Description**: Test description field
- [ ] **Document Upload**: Test file upload functionality
- [ ] **Submit**: Test form submission
- [ ] **Error Handling**: Test error states

#### DrawApprovalWorkflow
- [ ] **Pending Draws**: Verify pending draws display
- [ ] **Approval Actions**: Test approve/reject actions
- [ ] **Comments**: Test approval comments
- [ ] **Status Updates**: Verify status updates after actions
- [ ] **Notifications**: Test approval notifications

#### DrawStatusTracker
- [ ] **Status Display**: Verify current status display
- [ ] **Progress Indicators**: Test progress visualization
- [ ] **Timeline**: Test status timeline
- [ ] **Updates**: Test real-time status updates

### 3. Inspection Components Testing

#### InspectionScheduler
- [ ] **Date Selection**: Test date picker functionality
- [ ] **Inspector Assignment**: Test inspector selection
- [ ] **Location Input**: Test location field
- [ ] **Schedule**: Test scheduling functionality
- [ ] **Conflicts**: Test scheduling conflict detection

#### InspectionForm
- [ ] **Form Fields**: Test all form field functionality
- [ ] **Checklist**: Test inspection checklist
- [ ] **Photo Upload**: Test photo upload with camera support
- [ ] **GPS Location**: Test GPS location capture
- [ ] **Offline Mode**: Test offline form functionality

#### MobileInspectionApp
- [ ] **PWA Installation**: Test PWA install prompt
- [ ] **Offline Functionality**: Test offline mode
- [ ] **Camera Integration**: Test camera functionality
- [ ] **GPS Integration**: Test location services
- [ ] **Data Sync**: Test offline data synchronization

### 4. Dashboard Components Testing

#### PaymentDashboard
- [ ] **Metrics Display**: Verify all metrics display correctly
- [ ] **Quick Stats**: Test quick stats calculations
- [ ] **Charts**: Test payment trend charts
- [ ] **Calendar Integration**: Test payment calendar
- [ ] **Workflow Visualization**: Test payment workflow display
- [ ] **Real-time Updates**: Test dashboard updates

#### DrawDashboard
- [ ] **Activity Feed**: Test activity feed functionality
- [ ] **Status Breakdown**: Test status metrics
- [ ] **Progress Charts**: Test draw progress visualization
- [ ] **Workflow Visualization**: Test draw workflow display
- [ ] **Approval Actions**: Test approval workflow integration

#### InspectionDashboard
- [ ] **Inspector Workload**: Test workload distribution
- [ ] **Status Metrics**: Test inspection status metrics
- [ ] **Mobile Link**: Test mobile inspector link
- [ ] **Workflow Visualization**: Test inspection workflow display
- [ ] **Scheduling Integration**: Test inspection scheduling

### 5. Workflow Visualization Testing

#### WorkflowViewer
- [ ] **Node Rendering**: Test all node types render correctly
- [ ] **Edge Connections**: Test edge connections and labels
- [ ] **Interactive Features**: Test zoom, pan, and controls
- [ ] **MiniMap**: Test minimap functionality
- [ ] **Responsive**: Test responsive behavior
- [ ] **Performance**: Test with large workflows

#### WorkflowStatus
- [ ] **Progress Display**: Test progress bar functionality
- [ ] **Current Step**: Test current step highlighting
- [ ] **Step Details**: Test step information display
- [ ] **Actions**: Test workflow action buttons

#### WorkflowLegend
- [ ] **Legend Items**: Test all legend items display
- [ ] **Color Coding**: Verify color consistency
- [ ] **Responsive**: Test responsive legend layout

### 6. Shared Components Testing

#### DataTable
- [ ] **Data Loading**: Test data loading and display
- [ ] **Sorting**: Test column sorting
- [ ] **Filtering**: Test filtering functionality
- [ ] **Pagination**: Test pagination controls
- [ ] **Selection**: Test row selection
- [ ] **Actions**: Test action buttons

#### StatusBadge
- [ ] **Status Colors**: Test all status color variations
- [ ] **Text Display**: Test status text display
- [ ] **Icons**: Test status icons
- [ ] **Responsive**: Test responsive behavior

#### CurrencyInput
- [ ] **Amount Formatting**: Test currency formatting
- [ ] **Validation**: Test amount validation
- [ ] **Input Behavior**: Test input field behavior
- [ ] **Error States**: Test error state display

## API Integration Testing

### Payment API Endpoints
```bash
# Test payment creation
curl -X POST "http://localhost:3000/api/v1/loans/test-loan-1/payments" \
  -H "Content-Type: application/json" \
  -d '{"amount": 2500, "paymentType": "principal", "paymentMethod": "bank_transfer"}'

# Test payment update
curl -X PATCH "http://localhost:3000/api/v1/payments/test-payment-1" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Test payment schedule
curl -X GET "http://localhost:3000/api/v1/loans/test-loan-1/payment-schedule"
```

### Draw API Endpoints
```bash
# Test draw creation
curl -X POST "http://localhost:3000/api/v1/loans/test-loan-1/draws" \
  -H "Content-Type: application/json" \
  -d '{"amountRequested": 50000, "description": "Foundation work"}'

# Test draw status update
curl -X PATCH "http://localhost:3000/api/v1/draws/test-draw-1/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Inspection API Endpoints
```bash
# Test inspection creation
curl -X POST "http://localhost:3000/api/v1/inspections" \
  -H "Content-Type: application/json" \
  -d '{"drawId": "test-draw-1", "scheduledDate": "2024-01-20"}'

# Test inspection completion
curl -X POST "http://localhost:3000/api/v1/inspections/test-inspection-1/complete" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "findings": "Work completed satisfactorily"}'
```

## Mobile Responsiveness Testing

### Viewport Testing
- [ ] **Mobile (375px)**: Test all components on mobile viewport
- [ ] **Tablet (768px)**: Test tablet layout
- [ ] **Desktop (1024px+)**: Test desktop layout
- [ ] **Large Desktop (1440px+)**: Test large screen layout

### Touch Interactions
- [ ] **Touch Targets**: Verify touch targets are 44px minimum
- [ ] **Swipe Gestures**: Test swipe functionality where applicable
- [ ] **Pinch Zoom**: Test pinch zoom on workflow visualizations
- [ ] **Scroll Behavior**: Test smooth scrolling

## PWA Functionality Testing

### Installation
- [ ] **Install Prompt**: Test PWA install prompt
- [ ] **App Icon**: Verify app icon displays correctly
- [ ] **Splash Screen**: Test splash screen functionality
- [ ] **App Name**: Verify app name displays correctly

### Offline Functionality
- [ ] **Offline Detection**: Test offline detection
- [ ] **Cached Resources**: Test cached resource loading
- [ ] **Offline Forms**: Test offline form functionality
- [ ] **Data Sync**: Test data synchronization when online

### Service Worker
- [ ] **Registration**: Test service worker registration
- [ ] **Cache Strategy**: Test caching strategy
- [ ] **Update Handling**: Test service worker updates
- [ ] **Error Handling**: Test service worker error handling

## Performance Testing

### Bundle Size
- [ ] **Initial Load**: Test initial bundle size
- [ ] **Code Splitting**: Test code splitting effectiveness
- [ ] **Lazy Loading**: Test lazy loading functionality
- [ ] **Tree Shaking**: Verify unused code elimination

### Runtime Performance
- [ ] **Render Performance**: Test component render performance
- [ ] **Memory Usage**: Monitor memory usage
- [ ] **Network Requests**: Optimize API request patterns
- [ ] **Image Optimization**: Test image loading performance

## Error Handling Testing

### Network Errors
- [ ] **API Failures**: Test API failure handling
- [ ] **Timeout Handling**: Test request timeout handling
- [ ] **Retry Logic**: Test retry mechanisms
- [ ] **Fallback UI**: Test fallback UI states

### User Errors
- [ ] **Form Validation**: Test form validation errors
- [ ] **Input Errors**: Test input error states
- [ ] **Permission Errors**: Test permission error handling
- [ ] **File Upload Errors**: Test file upload error handling

## Accessibility Testing

### Keyboard Navigation
- [ ] **Tab Order**: Test logical tab order
- [ ] **Focus Management**: Test focus management
- [ ] **Keyboard Shortcuts**: Test keyboard shortcuts
- [ ] **Screen Reader**: Test screen reader compatibility

### Visual Accessibility
- [ ] **Color Contrast**: Test color contrast ratios
- [ ] **Text Size**: Test text size scaling
- [ ] **High Contrast**: Test high contrast mode
- [ ] **Focus Indicators**: Test focus indicators

## Test Automation

### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### E2E Tests
```bash
# Run end-to-end tests
npm run test:e2e
```

## Test Data Cleanup

### After Testing
- [ ] **Clean Test Data**: Remove test data from database
- [ ] **Reset State**: Reset application state
- [ ] **Clear Cache**: Clear browser cache
- [ ] **Reset Service Worker**: Reset service worker cache

## Reporting Issues

### Issue Template
```markdown
## Issue Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 14]
- OS: [e.g., iOS 17]

## Screenshots
If applicable, add screenshots

## Additional Context
Any additional context about the issue
```

## Success Criteria

### Component Functionality
- [ ] All components render without errors
- [ ] All interactive elements work correctly
- [ ] All forms submit successfully
- [ ] All data displays correctly

### Performance
- [ ] Initial load time < 3 seconds
- [ ] Component render time < 100ms
- [ ] Bundle size optimized
- [ ] Memory usage stable

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets standards

### Mobile Experience
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] PWA installs correctly
- [ ] Offline functionality works

This testing guide ensures comprehensive validation of all Sprint 3 Phase 2 UI components and their integration with the backend systems.
