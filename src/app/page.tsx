"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { AllocationCard } from "@/components/AllocationCard";
import { AllocationGroup } from "@/components/AllocationGroup";
import { AllocationLedger } from "@/components/AllocationLedger";
import { IncomeSummary } from "@/components/IncomeSummary";
import { defaultAllocations } from "@/data/defaultAllocations";
import { calculateTree, flattenLedger, formatPercent, getPercentages, isBalanced, restorePercentages, STORAGE_KEY, sumPercentages, updatePercentage } from "@/lib/calculations";
import type { AllocationNode, Currency, SavedPlan } from "@/types/allocation";

const DEFAULT_INCOME = 1000000;
const supportedCurrencies: Currency[] = ["NGN", "USD", "GBP", "EUR"];

export default function Home() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [incomeDraft, setIncomeDraft] = useState(String(DEFAULT_INCOME));
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [allocations, setAllocations] = useState<AllocationNode[]>(defaultAllocations);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SavedPlan>;
          if (typeof parsed.income === "number" && Number.isFinite(parsed.income) && parsed.income >= 0) {
            setIncome(parsed.income);
            setIncomeDraft(String(parsed.income));
          }
          if (parsed.currency && supportedCurrencies.includes(parsed.currency)) setCurrency(parsed.currency);
          if (parsed.percentages && typeof parsed.percentages === "object") {
            setAllocations(restorePercentages(defaultAllocations, parsed.percentages));
          }
        }
      } catch {
        // A damaged or unavailable local store should not prevent the dashboard from working.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, currency, percentages: getPercentages(allocations) } satisfies SavedPlan));
    } catch {
      // The live dashboard remains usable when browser storage is unavailable.
    }
  }, [income, currency, allocations, hydrated]);

  const calculated = useMemo(() => calculateTree(allocations, income), [allocations, income]);
  const ledger = useMemo(() => flattenLedger(calculated), [calculated]);
  const topLevelTotal = sumPercentages(allocations);
  const balanced = isBalanced(topLevelTotal);
  const kingdom = calculated.find((node) => node.id === "kingdom");
  const personal = calculated.find((node) => node.id === "personal");
  const investment = personal?.children?.find((node) => node.id === "investment");

  function changePercentage(id: string, value: number) {
    setAllocations((current) => updatePercentage(current, id, value));
    setSaved(false);
  }

  function changeIncomeDraft(value: string) {
    const normalized = value.replaceAll(",", "");
    if (!/^\d*(?:\.\d{0,2})?$/.test(normalized)) return;
    setIncomeDraft(normalized);
    setIncome(normalized === "" || normalized === "." ? 0 : Number(normalized));
    setSaved(false);
  }

  function reset() {
    setIncome(DEFAULT_INCOME);
    setIncomeDraft(String(DEFAULT_INCOME));
    setCurrency("NGN");
    setAllocations(defaultAllocations);
    setSaved(false);
  }

  if (!kingdom || !personal || !investment) return null;

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>Personal Financial System</span></div>
        <div className="header-note"><ShieldCheck size={15} /> Private, on this device</div>
      </header>

      <div className="page-content">
        <div className="intro-row">
          <div>
            <p className="eyebrow"><Sparkles size={14} /> YOUR MONEY, WITH INTENTION</p>
            <h1>Give every amount<br /><em>a purpose.</em></h1>
            <p className="intro-copy">A simple way to see where your income goes. Shape each allocation and watch the full picture update instantly.</p>
          </div>
          <div className="intro-aside"><span className="aside-line" /><p>Clarity at every level.<br />Confidence in every decision.</p></div>
        </div>

        <IncomeSummary income={income} incomeDraft={incomeDraft} currency={currency} allocatedPercentage={topLevelTotal} onIncomeDraftChange={changeIncomeDraft} onCurrencyChange={(value) => { setCurrency(value); setSaved(false); }} />

        <section className="top-section" aria-labelledby="allocation-heading">
          <div className="section-heading top-heading">
            <div><p className="eyebrow">01 / THE FOUNDATION</p><h2 id="allocation-heading">Your income allocation</h2><p>Adjust each share until the five allocations total exactly 100%.</p></div>
            <div className="section-actions">
              <button className="reset-button" type="button" onClick={reset}><RotateCcw size={16} /> Reset to defaults</button>
              <button className="save-button" type="button" disabled={!balanced} onClick={() => setSaved(true)}><Check size={17} /> {saved ? "Plan saved" : "Save plan"}</button>
            </div>
          </div>
          {!balanced && <div className="validation-message" role="alert">The top-level allocation must equal 100% before you can save this plan. Adjust one or more other shares to balance it.</div>}
          <div className="allocation-grid">{calculated.map((node) => <AllocationCard key={node.id} node={node} currency={currency} onChange={changePercentage} />)}</div>
          <div className="allocation-footnote"><span className="footnote-dot" /> Direct allocations go straight to a final destination. Reallocations are divided further below.</div>
        </section>

        <section className="nested-section" aria-labelledby="nested-heading">
          <div className="section-heading"><div><p className="eyebrow">02 / THE DETAILS</p><h2 id="nested-heading">Explore the layers</h2></div><p>Every percentage here is a share of its immediate parent.</p></div>
          <div className="group-stack">
            <AllocationGroup parent={kingdom} title="Kingdom Investment" eyebrow="BRANCH 01" description="How your kingdom allocation is shared." currency={currency} onChange={changePercentage} />
            <AllocationGroup parent={personal} title="Personal Allocation" eyebrow="BRANCH 02" description="Direct your personal portion between investing and enjoyment." currency={currency} onChange={changePercentage} />
            <AllocationGroup parent={investment} title="Investment Allocation" eyebrow="BRANCH 02 / DEEPER VIEW" description="A closer look at the investment portion of your personal allocation." currency={currency} onChange={changePercentage} />
          </div>
        </section>

        <AllocationLedger rows={ledger} currency={currency} />

        <section className="explanation" aria-labelledby="explanation-heading">
          <div><p className="eyebrow">A NOTE ON THE MATH</p><h2 id="explanation-heading">How the percentages flow</h2><p>Each layer takes a share of the amount above it. The effective share tells you what a destination receives from your total income.</p></div>
          <div className="formula-card">
            <p>Effective % = Parent % × Internal %</p>
            <div><span>Poor</span><strong>{formatPercent(kingdom.percentage)} × {formatPercent(kingdom.children?.find((node) => node.id === "poor")?.percentage ?? 0)} = {formatPercent(kingdom.children?.find((node) => node.id === "poor")?.effectivePercentage ?? 0)}</strong></div>
            <div><span>Wisdom / Learning</span><strong>{formatPercent(personal.percentage)} × {formatPercent(investment.percentage)} × {formatPercent(investment.children?.find((node) => node.id === "wisdom")?.percentage ?? 0)} = {formatPercent(investment.children?.find((node) => node.id === "wisdom")?.effectivePercentage ?? 0)}</strong></div>
          </div>
        </section>
      </div>
      <footer className="site-footer"><span>Personal Financial System</span><span>Plan with purpose <ArrowRight size={14} /></span></footer>
    </main>
  );
}
