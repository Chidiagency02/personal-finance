import type { Currency, LedgerRow } from "@/types/allocation";
import { formatMoney, formatPercent } from "@/lib/calculations";

export function AllocationLedger({ rows, currency }: { rows: LedgerRow[]; currency: Currency }) {
  return (
    <section className="ledger-section" aria-labelledby="ledger-heading">
      <div className="section-heading">
        <div><p className="eyebrow">THE FULL PICTURE</p><h2 id="ledger-heading">Allocation ledger</h2></div>
        <p>Every final destination, traced back to your income.</p>
      </div>
      <div className="ledger-card">
        <div className="ledger-scroll">
          <table>
            <thead><tr><th scope="col">Final destination</th><th scope="col">Immediate parent</th><th scope="col">Share of parent</th><th scope="col">Effective share</th><th scope="col">Amount</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><span className={`ledger-dot ${row.parent === "Total Income" ? "ledger-dot-blue" : ""}`} />{row.destination}</td>
                  <td>{row.parent}</td>
                  <td>{formatPercent(row.shareOfParent)}</td>
                  <td><span className="ledger-share">{formatPercent(row.effectivePercentage)}</span></td>
                  <td className="ledger-amount">{formatMoney(row.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mobile-ledger">
          {rows.map((row) => (
            <article className="mobile-ledger-row" key={row.id}>
              <div className="mobile-ledger-title"><span className={`ledger-dot ${row.parent === "Total Income" ? "ledger-dot-blue" : ""}`} /><strong>{row.destination}</strong></div>
              <div className="mobile-ledger-parent"><span>Immediate parent</span><strong>{row.parent}</strong></div>
              <div className="mobile-ledger-metrics">
                <div><span>Share of parent</span><strong>{formatPercent(row.shareOfParent)}</strong></div>
                <div><span>Effective share</span><strong>{formatPercent(row.effectivePercentage)}</strong></div>
                <div><span>Amount</span><strong>{formatMoney(row.amount, currency)}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
