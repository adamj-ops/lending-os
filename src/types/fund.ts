/**
 * Fund Domain Types
 * 
 * TypeScript types for fund management, commitments, calls, and distributions
 */

import { InferSelectModel } from "drizzle-orm";
import { 
  funds, 
  fundCommitments, 
  fundCalls, 
  fundDistributions,
  fundLoanAllocations 
} from "@/db/schema";

/**
 * Base Fund Types (inferred from schema)
 */
export type Fund = InferSelectModel<typeof funds>;
export type FundCommitment = InferSelectModel<typeof fundCommitments>;
export type FundCall = InferSelectModel<typeof fundCalls>;
export type FundDistribution = InferSelectModel<typeof fundDistributions>;
export type FundLoanAllocation = InferSelectModel<typeof fundLoanAllocations>;

/**
 * Fund Enums
 */
export type FundType = "private" | "syndicated" | "institutional";
export type FundStatus = "active" | "closed" | "liquidated";
export type CommitmentStatus = "pending" | "active" | "fulfilled" | "cancelled";
export type CapitalCallStatus = "pending" | "sent" | "funded" | "overdue";
export type DistributionType = "return_of_capital" | "profit" | "interest";
export type DistributionStatus = "scheduled" | "processed" | "cancelled";

/**
 * Fund Creation DTO
 */
export interface CreateFundDTO {
  organizationId: string;
  name: string;
  fundType: FundType;
  totalCapacity: number | string;
  inceptionDate: Date;
  strategy?: string;
  targetReturn?: number | string;
  managementFeeBps?: number;
  performanceFeeBps?: number;
}

/**
 * Fund Update DTO
 */
export interface UpdateFundDTO {
  name?: string;
  fundType?: FundType;
  status?: FundStatus;
  totalCapacity?: number | string;
  strategy?: string;
  targetReturn?: number | string;
  managementFeeBps?: number;
  performanceFeeBps?: number;
  closingDate?: Date;
  liquidationDate?: Date;
}

/**
 * Fund Commitment Creation DTO
 */
export interface CreateFundCommitmentDTO {
  fundId: string;
  lenderId: string;
  committedAmount: number | string;
  commitmentDate: Date;
  status?: CommitmentStatus;
}

/**
 * Fund Call Creation DTO
 */
export interface CreateFundCallDTO {
  fundId: string;
  callNumber: number;
  callAmount: number | string;
  dueDate: Date;
  purpose?: string;
  notes?: string;
}

/**
 * Fund Distribution Creation DTO
 */
export interface CreateFundDistributionDTO {
  fundId: string;
  distributionDate: Date;
  totalAmount: number | string;
  distributionType: DistributionType;
  notes?: string;
}

/**
 * Fund Allocation Creation DTO
 */
export interface CreateFundAllocationDTO {
  fundId: string;
  loanId: string;
  allocatedAmount: number | string;
  allocationDate: Date;
}

/**
 * Fund with Calculated Metrics
 */
export interface FundWithMetrics extends Fund {
  // Calculated metrics
  deploymentRate: number; // Percentage of committed capital deployed
  returnRate: number; // Percentage of deployed capital returned
  uncommittedCapacity: number; // Remaining capacity for new commitments
  availableCapital: number; // Committed but not yet deployed capital
  
  // Counts
  investorCount: number;
  allocationCount: number;
  activeCallCount: number;
}

/**
 * Fund Commitment with Lender Info
 */
export interface FundCommitmentWithLender extends FundCommitment {
  lender: {
    id: string;
    name: string;
    entityType: string;
    contactEmail: string;
  };
  // Calculated metrics
  uncalledAmount: number; // Committed but not yet called
  netPosition: number; // Called amount minus returned amount
}

/**
 * Fund Allocation with Loan Info
 */
export interface FundAllocationWithLoan extends FundLoanAllocation {
  loan: {
    id: string;
    loanAmount: string;
    interestRate: string;
    status: string;
    borrowerId?: string;
  };
  // Calculated metrics
  outstandingAmount: number; // Allocated minus returned
  returnPercentage: number; // Percentage of allocated amount returned
}

/**
 * Fund Performance Metrics
 */
export interface FundPerformance {
  fundId: string;
  fundName: string;
  
  // Capital metrics
  totalCommitted: number;
  totalDeployed: number;
  totalReturned: number;
  netDeployed: number; // Deployed minus returned
  
  // Performance metrics
  deploymentRate: number; // Deployed / Committed
  returnRate: number; // Returned / Deployed
  irr: number | null; // Internal rate of return (calculated)
  moic: number | null; // Multiple on invested capital (Returned / Deployed)
  
  // Timing metrics
  avgDeploymentDays: number | null; // Average days from commitment to deployment
  avgReturnDays: number | null; // Average days from deployment to return
  
  // Period
  startDate: Date;
  endDate: Date;
}

/**
 * Fund Portfolio Summary
 */
export interface FundPortfolioSummary {
  organizationId: string;
  
  // Aggregate metrics
  totalFunds: number;
  activeFunds: number;
  totalAUM: number; // Assets under management (total deployed - total returned)
  totalCommitted: number;
  totalDeployed: number;
  totalReturned: number;
  
  // Performance
  portfolioIRR: number | null;
  portfolioMOIC: number | null;
  
  // By fund type
  byFundType: Array<{
    fundType: FundType;
    count: number;
    totalAUM: number;
    avgIRR: number | null;
  }>;
  
  // Top performers
  topFunds: Array<{
    fundId: string;
    fundName: string;
    aum: number;
    irr: number | null;
    moic: number | null;
  }>;
}

/**
 * Capital Call with Response Tracking
 */
export interface FundCallWithResponses extends FundCall {
  // Response tracking
  totalExpected: number; // Sum of all investor commitments for this call
  totalReceived: number; // Amount actually received
  receivedPercentage: number; // Percentage of expected amount received
  
  // Investor breakdown
  responses: Array<{
    lenderId: string;
    lenderName: string;
    expectedAmount: number;
    receivedAmount: number;
    status: "pending" | "received" | "partial";
  }>;
}

