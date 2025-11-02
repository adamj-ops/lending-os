/**
 * Payment Schedule Creator Handler
 *
 * Listens to Loan.Funded events and creates payment schedules.
 * This is a cross-domain handler (Loan → Payment).
 */

import { db } from '@/db/client';
import { paymentSchedules, payments } from '@/db/schema';
import { DomainEvent, EventTypes, LoanFundedPayload } from '../types';
import { PaymentType, PaymentMethod, PaymentStatus } from '@/types/payment';
import { addMonths, addDays } from 'date-fns';

/**
 * Handle Loan.Funded event by creating a payment schedule
 */
export async function handleLoanFunded(event: DomainEvent<LoanFundedPayload>): Promise<void> {
  const {
    loanId,
    organizationId,
    principal,
    rate,
    termMonths,
    paymentType,
    paymentFrequency,
    fundedDate,
  } = event.payload;

  console.log(`Creating payment schedule for loan ${loanId}`);

  // Calculate payment schedule based on frequency and type
  const schedule = calculatePaymentSchedule({
    principal: parseFloat(principal),
    rate: parseFloat(rate),
    termMonths,
    paymentType,
    paymentFrequency,
    startDate: fundedDate,
  });

  const scheduleTypeValue: 'amortized' | 'interest_only' =
    paymentType === 'amortized' ? 'amortized' : 'interest_only';
  const paymentFrequencyValue: 'monthly' | 'quarterly' | 'maturity' =
    paymentFrequency === 'quarterly'
      ? 'quarterly'
      : paymentFrequency === 'maturity'
        ? 'maturity'
        : 'monthly';

  // Create payment schedule record
  const [paymentSchedule] = await db
    .insert(paymentSchedules)
    .values({
      loanId,
      scheduleType: scheduleTypeValue,
      paymentFrequency: paymentFrequencyValue,
      totalPayments: schedule.payments.length.toString(),
      paymentAmount: schedule.payments[0]?.amount.toFixed(2) || '0',
      scheduleData: JSON.stringify(schedule.payments),
      isActive: '1',
    })
    .returning();

  console.log(`Created payment schedule ${paymentSchedule.id} with ${schedule.payments.length} payments`);

  // Create individual payment records
  for (const payment of schedule.payments) {
    await db.insert(payments).values({
      loanId,
      paymentType: PaymentType.COMBINED,
      amount: payment.amount.toFixed(2),
      principalAmount: payment.principal?.toFixed(2) || '0',
      interestAmount: payment.interest?.toFixed(2) || '0',
      feeAmount: '0',
      paymentMethod: PaymentMethod.ACH,
      status: PaymentStatus.PENDING,
      paymentDate: payment.dueDate.toISOString().slice(0, 10),
    });
  }

  console.log(`Created ${schedule.payments.length} payment records for schedule ${paymentSchedule.id}`);
}

/**
 * Payment Schedule Calculation
 */
interface PaymentScheduleParams {
  principal: number;
  rate: number; // Annual rate as percentage (e.g., 7.5)
  termMonths: number;
  paymentType: string; // 'interest_only' | 'amortized'
  paymentFrequency: string; // 'monthly' | 'quarterly' | 'maturity'
  startDate: Date;
}

interface ScheduledPayment {
  paymentNumber: number;
  dueDate: Date;
  amount: number;
  principal?: number;
  interest?: number;
}

interface PaymentSchedule {
  payments: ScheduledPayment[];
  totalAmount: number;
}

function calculatePaymentSchedule(params: PaymentScheduleParams): PaymentSchedule {
  const { principal, rate, termMonths, paymentType, paymentFrequency, startDate } = params;

  // Calculate number of payments based on frequency
  const numberOfPayments = calculateNumberOfPayments(termMonths, paymentFrequency);

  // Calculate payment amount
  const payments: ScheduledPayment[] = [];
  let totalAmount = 0;

  if (paymentType === 'interest_only') {
    // Interest-only: same interest payment each period, principal at end
    const periodicRate = calculatePeriodicRate(rate, paymentFrequency);
    const interestPayment = principal * (periodicRate / 100);

    for (let i = 1; i <= numberOfPayments; i++) {
      const isLastPayment = i === numberOfPayments;
      const dueDate = calculateDueDate(startDate, i, paymentFrequency);

      const payment: ScheduledPayment = {
        paymentNumber: i,
        dueDate,
        amount: isLastPayment ? interestPayment + principal : interestPayment,
        principal: isLastPayment ? principal : 0,
        interest: interestPayment,
      };

      payments.push(payment);
      totalAmount += payment.amount;
    }
  } else if (paymentType === 'amortized') {
    // Amortized: equal payments of principal + interest
    const periodicRate = calculatePeriodicRate(rate, paymentFrequency);
    const monthlyRate = periodicRate / 100;

    // Calculate payment amount using amortization formula
    const paymentAmount =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let remainingBalance = principal;

    for (let i = 1; i <= numberOfPayments; i++) {
      const dueDate = calculateDueDate(startDate, i, paymentFrequency);
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = paymentAmount - interestPayment;
      remainingBalance -= principalPayment;

      const payment: ScheduledPayment = {
        paymentNumber: i,
        dueDate,
        amount: paymentAmount,
        principal: principalPayment,
        interest: interestPayment,
      };

      payments.push(payment);
      totalAmount += payment.amount;
    }
  } else {
    throw new Error(`Unsupported payment type: ${paymentType}`);
  }

  return {
    payments,
    totalAmount,
  };
}

/**
 * Calculate number of payments based on term and frequency
 */
function calculateNumberOfPayments(termMonths: number, frequency: string): number {
  switch (frequency) {
    case 'monthly':
      return termMonths;
    case 'quarterly':
      return Math.ceil(termMonths / 3);
    case 'maturity':
      return 1;
    default:
      throw new Error(`Unsupported payment frequency: ${frequency}`);
  }
}

/**
 * Calculate periodic interest rate
 */
function calculatePeriodicRate(annualRate: number, frequency: string): number {
  switch (frequency) {
    case 'monthly':
      return annualRate / 12;
    case 'quarterly':
      return annualRate / 4;
    case 'maturity':
      return annualRate;
    default:
      throw new Error(`Unsupported payment frequency: ${frequency}`);
  }
}

/**
 * Calculate due date for a payment
 */
function calculateDueDate(startDate: Date, paymentNumber: number, frequency: string): Date {
  switch (frequency) {
    case 'monthly':
      return addMonths(startDate, paymentNumber);
    case 'quarterly':
      return addMonths(startDate, paymentNumber * 3);
    case 'maturity':
      return startDate;
    default:
      throw new Error(`Unsupported payment frequency: ${frequency}`);
  }
}
