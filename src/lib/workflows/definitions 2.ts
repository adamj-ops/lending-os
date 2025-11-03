// Workflow Definition Files for Lending OS
// These define the predefined flows for payment, draw, and inspection processes

export interface WorkflowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'parallel' | 'subprocess';
  label: string;
  description?: string;
  position: { x: number; y: number };
  data: {
    status?: string;
    required?: boolean;
    assignee?: string;
    estimatedDuration?: number; // in hours
    conditions?: string[];
    actions?: string[];
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'conditional' | 'parallel';
  data?: {
    condition?: string;
    probability?: number;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  type: 'payment' | 'draw' | 'inspection' | 'loan';
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    tags: string[];
  };
}

// Payment Workflow Definition
export const PAYMENT_WORKFLOW: WorkflowDefinition = {
  id: 'payment-workflow-v1',
  name: 'Payment Processing Workflow',
  description: 'Standard workflow for processing loan payments',
  type: 'payment',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Payment Initiated',
      description: 'Payment request received',
      position: { x: 100, y: 100 },
      data: {
        status: 'initiated',
        required: true,
        estimatedDuration: 0
      }
    },
    {
      id: 'validate',
      type: 'process',
      label: 'Validate Payment',
      description: 'Validate payment amount and loan status',
      position: { x: 300, y: 100 },
      data: {
        status: 'validating',
        required: true,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['check_amount', 'verify_loan_status', 'validate_payment_method']
      }
    },
    {
      id: 'decision',
      type: 'decision',
      label: 'Payment Valid?',
      description: 'Check if payment meets all requirements',
      position: { x: 500, y: 100 },
      data: {
        status: 'decision',
        required: true,
        estimatedDuration: 0.1,
        conditions: ['amount_valid', 'loan_active', 'payment_method_valid']
      }
    },
    {
      id: 'process_payment',
      type: 'process',
      label: 'Process Payment',
      description: 'Execute payment transaction',
      position: { x: 700, y: 50 },
      data: {
        status: 'processing',
        required: true,
        assignee: 'payment_processor',
        estimatedDuration: 2,
        actions: ['charge_payment_method', 'update_loan_balance', 'record_transaction']
      }
    },
    {
      id: 'reject_payment',
      type: 'process',
      label: 'Reject Payment',
      description: 'Reject invalid payment request',
      position: { x: 700, y: 150 },
      data: {
        status: 'rejected',
        required: false,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['notify_borrower', 'log_rejection_reason']
      }
    },
    {
      id: 'verify_payment',
      type: 'process',
      label: 'Verify Payment',
      description: 'Verify payment was successful',
      position: { x: 900, y: 50 },
      data: {
        status: 'verifying',
        required: true,
        assignee: 'system',
        estimatedDuration: 1,
        actions: ['check_transaction_status', 'verify_funds_received']
      }
    },
    {
      id: 'update_loan',
      type: 'process',
      label: 'Update Loan',
      description: 'Update loan balance and payment history',
      position: { x: 1100, y: 50 },
      data: {
        status: 'updating',
        required: true,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['update_balance', 'record_payment', 'update_schedule']
      }
    },
    {
      id: 'notify_completion',
      type: 'process',
      label: 'Notify Completion',
      description: 'Notify borrower of successful payment',
      position: { x: 1300, y: 50 },
      data: {
        status: 'notifying',
        required: true,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['send_confirmation_email', 'update_dashboard']
      }
    },
    {
      id: 'end_success',
      type: 'end',
      label: 'Payment Complete',
      description: 'Payment successfully processed',
      position: { x: 1500, y: 50 },
      data: {
        status: 'completed',
        required: true,
        estimatedDuration: 0
      }
    },
    {
      id: 'end_rejected',
      type: 'end',
      label: 'Payment Rejected',
      description: 'Payment request rejected',
      position: { x: 900, y: 150 },
      data: {
        status: 'rejected',
        required: true,
        estimatedDuration: 0
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'validate' },
    { id: 'e2', source: 'validate', target: 'decision' },
    { 
      id: 'e3', 
      source: 'decision', 
      target: 'process_payment',
      type: 'conditional',
      data: { condition: 'payment_valid', probability: 0.9 }
    },
    { 
      id: 'e4', 
      source: 'decision', 
      target: 'reject_payment',
      type: 'conditional',
      data: { condition: 'payment_invalid', probability: 0.1 }
    },
    { id: 'e5', source: 'process_payment', target: 'verify_payment' },
    { id: 'e6', source: 'verify_payment', target: 'update_loan' },
    { id: 'e7', source: 'update_loan', target: 'notify_completion' },
    { id: 'e8', source: 'notify_completion', target: 'end_success' },
    { id: 'e9', source: 'reject_payment', target: 'end_rejected' }
  ],
  metadata: {
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    tags: ['payment', 'automated', 'standard']
  }
};

// Draw Request Workflow Definition
export const DRAW_WORKFLOW: WorkflowDefinition = {
  id: 'draw-workflow-v1',
  name: 'Draw Request Workflow',
  description: 'Workflow for processing construction draw requests',
  type: 'draw',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Draw Requested',
      description: 'Borrower submits draw request',
      position: { x: 100, y: 200 },
      data: {
        status: 'requested',
        required: true,
        estimatedDuration: 0
      }
    },
    {
      id: 'initial_review',
      type: 'process',
      label: 'Initial Review',
      description: 'Review draw request completeness',
      position: { x: 300, y: 200 },
      data: {
        status: 'reviewing',
        required: true,
        assignee: 'loan_officer',
        estimatedDuration: 2,
        actions: ['check_documents', 'verify_amount', 'review_justification']
      }
    },
    {
      id: 'decision_review',
      type: 'decision',
      label: 'Documents Complete?',
      description: 'Check if all required documents provided',
      position: { x: 500, y: 200 },
      data: {
        status: 'decision',
        required: true,
        estimatedDuration: 0.1,
        conditions: ['documents_complete', 'amount_reasonable', 'justification_valid']
      }
    },
    {
      id: 'request_documents',
      type: 'process',
      label: 'Request Documents',
      description: 'Request missing documents from borrower',
      position: { x: 700, y: 300 },
      data: {
        status: 'requesting',
        required: false,
        assignee: 'loan_officer',
        estimatedDuration: 1,
        actions: ['send_document_request', 'set_deadline']
      }
    },
    {
      id: 'schedule_inspection',
      type: 'process',
      label: 'Schedule Inspection',
      description: 'Schedule site inspection',
      position: { x: 700, y: 100 },
      data: {
        status: 'scheduling',
        required: true,
        assignee: 'inspection_coordinator',
        estimatedDuration: 4,
        actions: ['find_inspector', 'schedule_date', 'notify_parties']
      }
    },
    {
      id: 'conduct_inspection',
      type: 'subprocess',
      label: 'Conduct Inspection',
      description: 'Perform site inspection',
      position: { x: 900, y: 100 },
      data: {
        status: 'inspecting',
        required: true,
        assignee: 'inspector',
        estimatedDuration: 8,
        actions: ['visit_site', 'document_progress', 'take_photos', 'complete_checklist']
      }
    },
    {
      id: 'review_inspection',
      type: 'process',
      label: 'Review Inspection',
      description: 'Review inspection results',
      position: { x: 1100, y: 100 },
      data: {
        status: 'reviewing',
        required: true,
        assignee: 'loan_officer',
        estimatedDuration: 2,
        actions: ['review_report', 'verify_progress', 'check_compliance']
      }
    },
    {
      id: 'approval_decision',
      type: 'decision',
      label: 'Approve Draw?',
      description: 'Final approval decision',
      position: { x: 1300, y: 200 },
      data: {
        status: 'decision',
        required: true,
        estimatedDuration: 0.5,
        conditions: ['inspection_passed', 'progress_verified', 'amount_justified']
      }
    },
    {
      id: 'approve_draw',
      type: 'process',
      label: 'Approve Draw',
      description: 'Approve and process draw',
      position: { x: 1500, y: 100 },
      data: {
        status: 'approving',
        required: true,
        assignee: 'loan_officer',
        estimatedDuration: 1,
        actions: ['approve_request', 'initiate_payment', 'update_loan']
      }
    },
    {
      id: 'reject_draw',
      type: 'process',
      label: 'Reject Draw',
      description: 'Reject draw request',
      position: { x: 1500, y: 300 },
      data: {
        status: 'rejecting',
        required: false,
        assignee: 'loan_officer',
        estimatedDuration: 1,
        actions: ['document_rejection', 'notify_borrower', 'provide_feedback']
      }
    },
    {
      id: 'process_payment',
      type: 'process',
      label: 'Process Payment',
      description: 'Process approved draw payment',
      position: { x: 1700, y: 100 },
      data: {
        status: 'processing',
        required: true,
        assignee: 'payment_processor',
        estimatedDuration: 2,
        actions: ['transfer_funds', 'update_loan_balance', 'record_transaction']
      }
    },
    {
      id: 'notify_completion',
      type: 'process',
      label: 'Notify Completion',
      description: 'Notify borrower of payment',
      position: { x: 1900, y: 100 },
      data: {
        status: 'notifying',
        required: true,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['send_notification', 'update_dashboard']
      }
    },
    {
      id: 'end_approved',
      type: 'end',
      label: 'Draw Approved',
      description: 'Draw request approved and paid',
      position: { x: 2100, y: 100 },
      data: {
        status: 'approved',
        required: true,
        estimatedDuration: 0
      }
    },
    {
      id: 'end_rejected',
      type: 'end',
      label: 'Draw Rejected',
      description: 'Draw request rejected',
      position: { x: 1700, y: 300 },
      data: {
        status: 'rejected',
        required: true,
        estimatedDuration: 0
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'initial_review' },
    { id: 'e2', source: 'initial_review', target: 'decision_review' },
    { 
      id: 'e3', 
      source: 'decision_review', 
      target: 'schedule_inspection',
      type: 'conditional',
      data: { condition: 'documents_complete', probability: 0.8 }
    },
    { 
      id: 'e4', 
      source: 'decision_review', 
      target: 'request_documents',
      type: 'conditional',
      data: { condition: 'documents_incomplete', probability: 0.2 }
    },
    { id: 'e5', source: 'schedule_inspection', target: 'conduct_inspection' },
    { id: 'e6', source: 'conduct_inspection', target: 'review_inspection' },
    { id: 'e7', source: 'review_inspection', target: 'approval_decision' },
    { 
      id: 'e8', 
      source: 'approval_decision', 
      target: 'approve_draw',
      type: 'conditional',
      data: { condition: 'approved', probability: 0.7 }
    },
    { 
      id: 'e9', 
      source: 'approval_decision', 
      target: 'reject_draw',
      type: 'conditional',
      data: { condition: 'rejected', probability: 0.3 }
    },
    { id: 'e10', source: 'approve_draw', target: 'process_payment' },
    { id: 'e11', source: 'process_payment', target: 'notify_completion' },
    { id: 'e12', source: 'notify_completion', target: 'end_approved' },
    { id: 'e13', source: 'reject_draw', target: 'end_rejected' },
    { id: 'e14', source: 'request_documents', target: 'decision_review' }
  ],
  metadata: {
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    tags: ['draw', 'manual', 'inspection']
  }
};

// Inspection Workflow Definition
export const INSPECTION_WORKFLOW: WorkflowDefinition = {
  id: 'inspection-workflow-v1',
  name: 'Inspection Workflow',
  description: 'Workflow for conducting construction inspections',
  type: 'inspection',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Inspection Scheduled',
      description: 'Inspection scheduled for site visit',
      position: { x: 100, y: 150 },
      data: {
        status: 'scheduled',
        required: true,
        estimatedDuration: 0
      }
    },
    {
      id: 'prepare',
      type: 'process',
      label: 'Prepare Inspection',
      description: 'Prepare inspection materials and checklist',
      position: { x: 300, y: 150 },
      data: {
        status: 'preparing',
        required: true,
        assignee: 'inspector',
        estimatedDuration: 1,
        actions: ['review_documents', 'prepare_checklist', 'check_equipment']
      }
    },
    {
      id: 'travel',
      type: 'process',
      label: 'Travel to Site',
      description: 'Travel to inspection site',
      position: { x: 500, y: 150 },
      data: {
        status: 'traveling',
        required: true,
        assignee: 'inspector',
        estimatedDuration: 2,
        actions: ['navigate_to_site', 'arrive_on_time']
      }
    },
    {
      id: 'conduct',
      type: 'subprocess',
      label: 'Conduct Inspection',
      description: 'Perform site inspection',
      position: { x: 700, y: 150 },
      data: {
        status: 'inspecting',
        required: true,
        assignee: 'inspector',
        estimatedDuration: 4,
        actions: ['walk_through', 'take_photos', 'complete_checklist', 'note_issues']
      }
    },
    {
      id: 'document',
      type: 'process',
      label: 'Document Findings',
      description: 'Document inspection findings',
      position: { x: 900, y: 150 },
      data: {
        status: 'documenting',
        required: true,
        assignee: 'inspector',
        estimatedDuration: 2,
        actions: ['write_report', 'upload_photos', 'categorize_issues']
      }
    },
    {
      id: 'review',
      type: 'process',
      label: 'Review Report',
      description: 'Review inspection report',
      position: { x: 1100, y: 150 },
      data: {
        status: 'reviewing',
        required: true,
        assignee: 'supervisor',
        estimatedDuration: 1,
        actions: ['review_findings', 'verify_photos', 'check_completeness']
      }
    },
    {
      id: 'decision',
      type: 'decision',
      label: 'Report Complete?',
      description: 'Check if report meets standards',
      position: { x: 1300, y: 150 },
      data: {
        status: 'decision',
        required: true,
        estimatedDuration: 0.1,
        conditions: ['report_complete', 'photos_clear', 'findings_documented']
      }
    },
    {
      id: 'revise',
      type: 'process',
      label: 'Revise Report',
      description: 'Revise inspection report',
      position: { x: 1500, y: 250 },
      data: {
        status: 'revising',
        required: false,
        assignee: 'inspector',
        estimatedDuration: 1,
        actions: ['add_details', 'clarify_findings', 'improve_photos']
      }
    },
    {
      id: 'approve',
      type: 'process',
      label: 'Approve Report',
      description: 'Approve final inspection report',
      position: { x: 1500, y: 50 },
      data: {
        status: 'approving',
        required: true,
        assignee: 'supervisor',
        estimatedDuration: 0.5,
        actions: ['approve_report', 'notify_stakeholders']
      }
    },
    {
      id: 'distribute',
      type: 'process',
      label: 'Distribute Report',
      description: 'Distribute report to stakeholders',
      position: { x: 1700, y: 50 },
      data: {
        status: 'distributing',
        required: true,
        assignee: 'system',
        estimatedDuration: 0.5,
        actions: ['send_to_borrower', 'send_to_lender', 'update_dashboard']
      }
    },
    {
      id: 'end_complete',
      type: 'end',
      label: 'Inspection Complete',
      description: 'Inspection successfully completed',
      position: { x: 1900, y: 50 },
      data: {
        status: 'completed',
        required: true,
        estimatedDuration: 0
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'prepare' },
    { id: 'e2', source: 'prepare', target: 'travel' },
    { id: 'e3', source: 'travel', target: 'conduct' },
    { id: 'e4', source: 'conduct', target: 'document' },
    { id: 'e5', source: 'document', target: 'review' },
    { id: 'e6', source: 'review', target: 'decision' },
    { 
      id: 'e7', 
      source: 'decision', 
      target: 'approve',
      type: 'conditional',
      data: { condition: 'report_approved', probability: 0.8 }
    },
    { 
      id: 'e8', 
      source: 'decision', 
      target: 'revise',
      type: 'conditional',
      data: { condition: 'report_needs_revision', probability: 0.2 }
    },
    { id: 'e9', source: 'revise', target: 'review' },
    { id: 'e10', source: 'approve', target: 'distribute' },
    { id: 'e11', source: 'distribute', target: 'end_complete' }
  ],
  metadata: {
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    tags: ['inspection', 'field', 'manual']
  }
};

// Export all workflows
export const WORKFLOWS = {
  payment: PAYMENT_WORKFLOW,
  draw: DRAW_WORKFLOW,
  inspection: INSPECTION_WORKFLOW
};

// Helper function to get workflow by type
export function getWorkflow(type: 'payment' | 'draw' | 'inspection'): WorkflowDefinition {
  return WORKFLOWS[type];
}

// Helper function to get all workflows
export function getAllWorkflows(): WorkflowDefinition[] {
  return Object.values(WORKFLOWS);
}
