export function validateAmount(value: string): string | null {
  if (!value.trim()) {
    return "Amount is required";
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return "Amount must be greater than 0";
  }
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} is required`;
  }
  return null;
}
