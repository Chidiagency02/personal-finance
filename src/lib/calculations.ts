import type { AllocationNode, CalculatedNode, Currency, LedgerRow } from "@/types/allocation";

export const STORAGE_KEY = "personal-financial-system:v1";
const EPSILON = 0.000001;
const LEDGER_ORDER = ["tithe", "poor", "family", "friends", "offering", "vows", "enjoyment", "savings", "wisdom", "salary", "skills", "assets"];
const PERCENT_UNITS = 10000;

function splitUnits(weights: number[], total: number): number[] {
  if (weights.length === 0) return [];
  const weightTotal = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  const shares = weights.map((weight) => total * (weightTotal === 0 ? 1 / weights.length : Math.max(0, weight) / weightTotal));
  const units = shares.map(Math.floor);
  const remainder = total - units.reduce((sum, value) => sum + value, 0);
  const order = shares.map((share, index) => ({ index, fraction: share - units[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remainder; index += 1) units[order[index].index] += 1;
  return units;
}

/** Keep an edited top-level share exact to two decimals and apportion the rest. */
export function rebalanceTopLevel(nodes: AllocationNode[], editedId: string, percentage: number): AllocationNode[] {
  if (nodes.length === 0) return nodes;
  if (nodes.length === 1) return [{ ...nodes[0], percentage: 100 }];
  const target = nodes.find((node) => node.id === editedId);
  if (!target) return normalizeTopLevel(nodes);
  const targetUnits = Math.round(Math.min(100, Math.max(0, percentage)) * 100);
  const others = nodes.filter((node) => node.id !== editedId);
  const distributed = splitUnits(others.map((node) => node.percentage), PERCENT_UNITS - targetUnits);
  let otherIndex = 0;
  return nodes.map((node) => node.id === editedId
    ? { ...node, percentage: targetUnits / 100 }
    : { ...node, percentage: distributed[otherIndex++] / 100 });
}

/** Used after removal or when migrating a plan saved by an older version. */
export function normalizeTopLevel(nodes: AllocationNode[]): AllocationNode[] {
  if (nodes.length === 0) return nodes;
  const distributed = splitUnits(nodes.map((node) => node.percentage), PERCENT_UNITS);
  return nodes.map((node, index) => ({ ...node, percentage: distributed[index] / 100 }));
}

export function sumPercentages(nodes: Pick<AllocationNode, "percentage">[]): number {
  return Math.round(nodes.reduce((sum, node) => sum + Math.round(node.percentage * 1000), 0)) / 1000;
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
    ? rows.sort((a, b) => {
      const aIndex = LEDGER_ORDER.indexOf(a.id);
      const bIndex = LEDGER_ORDER.indexOf(b.id);
      return (aIndex < 0 ? LEDGER_ORDER.length : aIndex) - (bIndex < 0 ? LEDGER_ORDER.length : bIndex);
    })
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

export function restoreTopLevel(defaults: AllocationNode[], savedSections: unknown, values: Record<string, unknown>): AllocationNode[] {
  if (!Array.isArray(savedSections)) return normalizeTopLevel(restorePercentages(defaults, values));
  const defaultById = new Map(defaults.map((node) => [node.id, node]));
  const seen = new Set<string>();
  const sections: AllocationNode[] = [];
  for (const saved of savedSections.slice(0, 30)) {
    if (!saved || typeof saved !== "object" || typeof saved.id !== "string" || seen.has(saved.id)) continue;
    const original = defaultById.get(saved.id);
    if (original) {
      sections.push(original);
    } else if (/^custom-[\da-f-]{36}$/.test(saved.id) && typeof saved.name === "string" && saved.name.trim()) {
      sections.push({ id: saved.id, name: saved.name.trim().slice(0, 80), percentage: 0, kind: "direct" });
    } else {
      continue;
    }
    seen.add(saved.id);
  }
  return normalizeTopLevel(restorePercentages(sections.length ? sections : defaults, values));
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
