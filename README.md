# Personal Financial System

A responsive income allocation dashboard built with Next.js App Router, TypeScript, React, and Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To verify the production build, run `npm run build`.

## How it works

The five top-level percentages are independent editable values. The app shows their live sum and disables **Save plan** unless that sum is exactly 100%; it never changes another percentage on your behalf. Nested groups show a soft warning when they differ from 100% and continue calculating from the entered values.

The allocation tree and defaults are in `src/data/defaultAllocations.ts`. Pure functions in `src/lib/calculations.ts` calculate effective shares, amounts, ledger rows, and validation status. Reusable UI components live in `src/components/`; `src/app/page.tsx` coordinates state and localStorage persistence.

All plan data stays in your browser's localStorage. Currency selection changes formatting only; it does not convert between currencies.
