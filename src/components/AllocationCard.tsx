import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CalculatedNode, Currency } from "@/types/allocation";
import { formatMoney } from "@/lib/calculations";
import { PercentageInput } from "./PercentageInput";

interface Props {
  node: CalculatedNode;
  currency: Currency;
  onChange: (id: string, value: number) => void;
}

export function AllocationCard({ node, currency, onChange }: Props) {
  const isDirect = node.kind === "direct";
  return (
    <article className={`allocation-card ${isDirect ? "direct-card" : "reallocation-card"}`}>
      <div className="card-topline">
        <div className={`card-icon ${isDirect ? "blue-icon" : "green-icon"}`} aria-hidden="true">
          {isDirect ? <ArrowUpRight size={20} strokeWidth={1.8} /> : <ArrowDownRight size={20} strokeWidth={1.8} />}
        </div>
        <span className={`type-badge ${isDirect ? "badge-blue" : "badge-green"}`}>
          {isDirect ? "Direct allocation" : "Reallocation"}
        </span>
      </div>
      <h3>{node.name}</h3>
      <p className="card-amount">{formatMoney(node.amount, currency)}</p>
      <div className="card-bottom">
        <label htmlFor={`top-${node.id}`}>Share of total income</label>
        <PercentageInput id={`top-${node.id}`} value={node.percentage} onChange={(value) => onChange(node.id, value)} ariaLabel={`${node.name}, percentage of total income`} />
      </div>
      <div className="progress-track" aria-hidden="true"><span style={{ width: `${node.percentage}%` }} /></div>
    </article>
  );
}
