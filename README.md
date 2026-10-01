# Personal Financial System

A responsive income allocation dashboard built with Next.js App Router, TypeScript, React, and Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To verify the production build, run `npm run build`.
Run `npm run test:allocation` to check the top-level balancing and saved-plan restoration.

## How it works

Top-level sections can be added, renamed, or removed. New sections are direct allocations. Changing a top-level share keeps that share at the entered value and distributes the remainder proportionally across the other sections, rounded to two decimal places, so the total remains exactly 100%. Removing a section distributes its share across those left. At least one section must remain. Nested groups still show a soft warning when they differ from 100% and continue calculating from the entered values.

The allocation tree and defaults are in `src/data/defaultAllocations.ts`. Pure functions in `src/lib/calculations.ts` calculate effective shares, amounts, ledger rows, and validation status. Reusable UI components live in `src/components/`; `src/app/page.tsx` coordinates state and localStorage persistence.

Income, currency, theme, section list, and percentages stay in your browser's localStorage. The theme toggle switches between light and dark. Currency selection changes formatting only; it does not convert between currencies.
