import { colors } from "@/constants/colors";

export function getStatusColor(spent: number, adjustedBudget: number): string {
  if (adjustedBudget <= 0) {
    return colors.danger;
  }
  const ratio = spent / adjustedBudget;
  if (ratio < 0.5) {
    return colors.success;
  }
  if (ratio < 0.9) {
    return colors.warning;
  }
  return colors.danger;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}
