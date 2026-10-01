import type { AllocationNode } from "@/types/allocation";

export const defaultAllocations: AllocationNode[] = [
  { id: "tithe", name: "Tithe", percentage: 10, kind: "direct" },
  {
    id: "kingdom", name: "Kingdom Investment", percentage: 30, kind: "reallocation",
    children: [
      { id: "poor", name: "Poor", percentage: 50, kind: "direct" },
      { id: "family", name: "Family", percentage: 25, kind: "direct" },
      { id: "friends", name: "Friends", percentage: 25, kind: "direct" },
    ],
  },
  { id: "offering", name: "Offering", percentage: 10, kind: "direct" },
  { id: "vows", name: "Vows", percentage: 10, kind: "direct" },
  {
    id: "personal", name: "Pocket / Personal Finance / Personal Investment", percentage: 40, kind: "reallocation",
    children: [
      {
        id: "investment", name: "Investment", percentage: 80, kind: "reallocation",
        children: [
          { id: "savings", name: "Savings / Reputation / Relationships", percentage: 20, kind: "direct" },
          { id: "wisdom", name: "Wisdom / Learning", percentage: 40, kind: "direct" },
          { id: "salary", name: "Salary", percentage: 10, kind: "direct" },
          { id: "skills", name: "Secondary Skills", percentage: 10, kind: "direct" },
          { id: "assets", name: "Asset-Based Income", percentage: 20, kind: "direct" },
        ],
      },
      { id: "enjoyment", name: "Enjoyment", percentage: 20, kind: "direct" },
    ],
  },
];
