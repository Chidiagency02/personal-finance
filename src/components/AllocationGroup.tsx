import { ArrowRight } from "lucide-react";
import type { CalculatedNode, Currency } from "@/types/allocation";
import { formatMoney, formatPercent, sumPercentages } from "@/lib/calculations";
import { PercentageInput } from "./PercentageInput";
import { PercentageStatus } from "./PercentageStatus";

interface Props {
  parent: CalculatedNode;
  title: string;
  eyebrow: string;
  description: string;
  currency: Currency;
  onChange: (id: string, value: number) => void;
}

export function AllocationGroup({ parent, title, eyebrow, description, currency, onChange }: Props) {
  const children = parent.children ?? [];
  return (
    <section className="group-card" aria-labelledby={`${parent.id}-title`}>
      <div className="group-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3 id={`${parent.id}-title`}>{title}</h3>
          <p className="group-description">{description}</p>
        </div>
        <div className="group-total">
          <span>Available to allocate</span>
          <strong>{formatMoney(parent.amount, currency)}</strong>
          <small>{formatPercent(parent.effectivePercentage)} of total income</small>
        </div>
      </div>
      <div className="group-status"><PercentageStatus total={sumPercentages(children)} /></div>
      <div className="group-rows">
        {children.map((child) => (
          <div className="group-row" key={child.id}>
            <div className="group-row-name">
              <span className="row-dot" aria-hidden="true" />
              <div>
                <strong>{child.name}</strong>
                {child.children?.length ? <small>Continues into the investment allocation <ArrowRight size={12} /></small> : null}
              </div>
            </div>
            <div className="row-share">
              <label htmlFor={`nested-${child.id}`}>Of parent</label>
              <PercentageInput id={`nested-${child.id}`} value={child.percentage} onChange={(value) => onChange(child.id, value)} ariaLabel={`${child.name}, percentage of ${parent.name}`} compact />
            </div>
            <div className="row-effective"><span>Of total</span><strong>{formatPercent(child.effectivePercentage)}</strong></div>
            <div className="row-amount"><span>Amount</span><strong>{formatMoney(child.amount, currency)}</strong></div>
          </div>
        ))}
      </div>
    </section>
  );
}
