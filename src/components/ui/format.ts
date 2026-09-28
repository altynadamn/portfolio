import type { YearMonth } from "@/content/types";

export function formatYearMonth(value: YearMonth, months: string[]): string {
  const [year, month] = value.split("-");
  return `${months[Number(month) - 1]} ${year}`;
}
