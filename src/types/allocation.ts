export type AllocationKind = "direct" | "reallocation";
export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type Theme = "light" | "dark";

export interface AllocationNode {
  id: string;
  name: string;
  percentage: number;
  kind: AllocationKind;
  children?: AllocationNode[];
}

export interface CalculatedNode extends AllocationNode {
  effectivePercentage: number;
  amount: number;
  children?: CalculatedNode[];
}

export interface LedgerRow {
  id: string;
  destination: string;
  parent: string;
  shareOfParent: number;
  effectivePercentage: number;
  amount: number;
  kind: AllocationKind;
}

export interface SavedPlan {
  income: number;
  currency: Currency;
  percentages: Record<string, number>;
  theme?: Theme;
  topLevel?: Array<{ id: string; name: string }>;
}
