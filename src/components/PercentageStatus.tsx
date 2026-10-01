import { CircleAlert, CircleCheck } from "lucide-react";
import { formatPercent, isBalanced } from "@/lib/calculations";

export function PercentageStatus({ total, strict = false }: { total: number; strict?: boolean }) {
  const balanced = isBalanced(total);
  const delta = Math.abs(100 - total);
  const message = balanced
    ? strict ? "100% allocated — perfectly balanced" : "Fully allocated"
    : strict
      ? total < 100 ? `${formatPercent(total)} allocated — ${formatPercent(delta)} remaining` : `${formatPercent(total)} allocated — reduce by ${formatPercent(delta)}`
      : total < 100 ? `${formatPercent(delta)} unallocated` : `${formatPercent(delta)} overallocated`;

  return (
    <div className={`status-pill ${balanced ? "status-good" : strict ? "status-error" : "status-warning"}`} role="status" aria-live="polite">
      {balanced ? <CircleCheck size={15} /> : <CircleAlert size={15} />}
      <span>{message}</span>
    </div>
  );
}
