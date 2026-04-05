import { UserCategory, UserCategorySnapshot } from "@/types";

export function calculateCarryover(previousSnapshot: UserCategorySnapshot): number {
  return previousSnapshot.adjustedBudget - previousSnapshot.spent;
}

export function calculateNewSnapshot(
  category: UserCategory,
  previousSnapshot: UserCategorySnapshot | null,
  rolloverEnabled: boolean,
  overspendingEnabled: boolean
): UserCategorySnapshot {
  let carryover = 0;
  if (category.type === "budgeted" && rolloverEnabled && previousSnapshot) {
    carryover = calculateCarryover(previousSnapshot);
    if (!overspendingEnabled && carryover < 0) {
      carryover = 0;
    }
  }

  const adjustedBudget = category.baseBudget + carryover;
  const spent = 0;
  const remaining = adjustedBudget;

  return {
    categoryId: category.id,
    categoryName: category.name,
    type: category.type,
    baseBudget: category.baseBudget,
    carryover,
    adjustedBudget,
    spent,
    remaining
  };
}

export function calculateMonthTotals(
  snapshots: UserCategorySnapshot[],
  income: number
): { fixedTotal: number; variableSpent: number; remaining: number } {
  const fixedTotal = snapshots
    .filter((snapshot) => snapshot.type === "fixed")
    .reduce((sum, snapshot) => sum + snapshot.baseBudget, 0);

  const variableSpent = snapshots
    .filter((snapshot) => snapshot.type === "budgeted")
    .reduce((sum, snapshot) => sum + snapshot.spent, 0);

  return {
    fixedTotal,
    variableSpent,
    remaining: income - fixedTotal - variableSpent
  };
}
