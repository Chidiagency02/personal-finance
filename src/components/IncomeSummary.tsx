"use client";

import { ChevronDown, Wallet } from "lucide-react";
import type { Currency } from "@/types/allocation";
import { formatMoney, formatPercent } from "@/lib/calculations";
import { PercentageStatus } from "./PercentageStatus";

const currencies: Currency[] = ["NGN", "USD", "GBP", "EUR"];

interface Props {
  income: number;
  incomeDraft: string;
  currency: Currency;
  allocatedPercentage: number;
  onIncomeDraftChange: (value: string) => void;
  onCurrencyChange: (currency: Currency) => void;
}

export function IncomeSummary({ income, incomeDraft, currency, allocatedPercentage, onIncomeDraftChange, onCurrencyChange }: Props) {
  return (
    <section className="income-panel" aria-label="Income summary">
      <div className="income-main">
        <div className="income-icon" aria-hidden="true"><Wallet size={22} strokeWidth={1.7} /></div>
        <div className="income-field">
          <label htmlFor="current-income">Current income</label>
          <div className="income-input-row">
            <input id="current-income" type="text" inputMode="decimal" autoComplete="off" value={incomeDraft} onChange={(event) => onIncomeDraftChange(event.target.value)} aria-describedby="income-hint" />
            <div className="currency-wrap">
              <select aria-label="Currency" value={currency} onChange={(event) => onCurrencyChange(event.target.value as Currency)}>
                {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </div>
          </div>
          <p id="income-hint">Enter the amount you want to allocate. Figures update as you type.</p>
        </div>
      </div>
      <div className="income-stats">
        <div><span>Total allocated</span><strong>{formatPercent(allocatedPercentage)}</strong></div>
        <div><span>Allocated amount</span><strong>{formatMoney(income * (allocatedPercentage / 100), currency)}</strong></div>
        <PercentageStatus total={allocatedPercentage} strict />
      </div>
    </section>
  );
}
