import type { AllocationNode, CalculatedNode, Currency, LedgerRow } from "@/types/allocation";

export const STORAGE_KEY = "personal-financial-system:v1";
const EPSILON = 0.000001;
const LEDGER_ORDER = ["tithe", "poor", "family", "friends", "offering", "vows", "enjoyment", "savings", "wisdom", "salary", "skills", "assets"];

export function sumPercentages(nodes: Pick<AllocationNode, "percentage">[]): number {
  return nodes.reduce((sum, node) => sum + node.percentage, 0);
}

export function isBalanced(total: number): boolean {
  return Math.abs(total - 100) < EPSILON;
}

export function calculateTree(nodes: AllocationNode[], income: number, parentEffective = 100): CalculatedNode[] {
  return nodes.map((node) => {
    const effectivePercentage = parentEffective * (node.percentage / 100);
    return {
      ...node,
      effectivePercentage,
      amount: income * (effectivePercentage / 100),
      children: node.children ? calculateTree(node.children, income, effectivePercentage) : undefined,
    };
  });
}

export function flattenLedger(nodes: CalculatedNode[], parent = "Total Income"): LedgerRow[] {
  const rows = nodes.flatMap((node): LedgerRow[] => {
    if (node.children?.length) return flattenLedger(node.children, node.name);
    return [{
      id: node.id,
      destination: node.name,
      parent,
      shareOfParent: node.percentage,
      effectivePercentage: node.effectivePercentage,
      amount: node.amount,
      kind: node.kind,
    }];
  });
  return parent === "Total Income"
    ? rows.sort((a, b) => LEDGER_ORDER.indexOf(a.id) - LEDGER_ORDER.indexOf(b.id))
    : rows;
}

export function updatePercentage(nodes: AllocationNode[], id: string, percentage: number): AllocationNode[] {
  return nodes.map((node) => ({
    ...node,
    percentage: node.id === id ? percentage : node.percentage,
    children: node.children ? updatePercentage(node.children, id, percentage) : undefined,
  }));
}

export function getPercentages(nodes: AllocationNode[]): Record<string, number> {
  return Object.fromEntries(nodes.flatMap((node) => [
    [node.id, node.percentage],
    ...Object.entries(node.children ? getPercentages(node.children) : {}),
  ]));
}

export function restorePercentages(nodes: AllocationNode[], values: Record<string, unknown>): AllocationNode[] {
  return nodes.map((node) => {
    const value = values[node.id];
    return {
      ...node,
      percentage: typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : node.percentage,
      children: node.children ? restorePercentages(node.children, values) : undefined,
    };
  });
}

export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value)}%`;
}
