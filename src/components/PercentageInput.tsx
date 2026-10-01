"use client";

import { useState } from "react";

interface Props {
  id: string;
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  ariaLabel: string;
}

export function PercentageInput({ id, value, onChange, compact = false, ariaLabel }: Props) {
  const [draft, setDraft] = useState({ raw: String(value), numeric: value });
  const displayValue = draft.numeric === value ? draft.raw : String(value);

  return (
    <div className={`percentage-input ${compact ? "percentage-input-compact" : ""}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        value={displayValue}
        onChange={(event) => {
          const next = event.target.value;
          if (!/^(?:\d{0,3})(?:\.\d{0,3})?$/.test(next)) return;
          if (next !== "" && Number(next) > 100) return;
          const numeric = next === "" || next === "." ? 0 : Number(next);
          setDraft({ raw: next, numeric });
          onChange(numeric);
        }}
        onBlur={() => setDraft({ raw: String(value), numeric: value })}
      />
      <span aria-hidden="true">%</span>
    </div>
  );
}
