import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import type { CalculatedNode, Currency } from "@/types/allocation";
import { formatMoney } from "@/lib/calculations";
import { PercentageInput } from "./PercentageInput";

interface Props {
  node: CalculatedNode;
  currency: Currency;
  onChange: (id: string, value: number) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  canRemove: boolean;
}

export function AllocationCard({ node, currency, onChange, onRemove, onRename, canRemove }: Props) {
  const isDirect = node.kind === "direct";
  const isCustom = node.id.startsWith("custom-");
  return (
    <article className={`allocation-card ${isDirect ? "direct-card" : "reallocation-card"}`}>
      <div className="card-topline">
        <div className={`card-icon ${isDirect ? "blue-icon" : "green-icon"}`} aria-hidden="true">
          {isDirect ? <ArrowUpRight size={20} strokeWidth={1.8} /> : <ArrowDownRight size={20} strokeWidth={1.8} />}
        </div>
        <div className="card-controls">
          <span className={`type-badge ${isDirect ? "badge-blue" : "badge-green"}`}>
            {isDirect ? "Direct allocation" : "Reallocation"}
          </span>
          <button type="button" className="remove-card" aria-label={`Remove ${node.name}`} title={`Remove ${node.name}`} disabled={!canRemove} onClick={() => onRemove(node.id)}><X size={14} /></button>
        </div>
      </div>
      {isCustom ? <input className="card-name-input" aria-label={`Rename ${node.name}`} defaultValue={node.name} maxLength={80} onBlur={(event) => {
        const name = event.currentTarget.value.trim();
        if (name) onRename(node.id, name);
        else event.currentTarget.value = node.name;
      }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /> : <h3>{node.name}</h3>}
      <p className="card-amount">{formatMoney(node.amount, currency)}</p>
      <div className="card-bottom">
        <label htmlFor={`top-${node.id}`}>Share of total income</label>
        <PercentageInput id={`top-${node.id}`} value={node.percentage} onChange={(value) => onChange(node.id, value)} ariaLabel={`${node.name}, percentage of total income`} disabled={!canRemove} maxDecimals={2} />
      </div>
      <div className="progress-track" aria-hidden="true"><span style={{ width: `${node.percentage}%` }} /></div>
    </article>
  );
}
