import { Badge } from "@/components/ui/badge";
import { LoanStatus } from "@/types/loan";
import { getStatusLabel, getStatusVariant } from "@/lib/loan-state-machine";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}

