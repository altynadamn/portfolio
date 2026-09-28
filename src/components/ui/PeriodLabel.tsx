import type { Period } from "@/content/types";
import type { UiStrings } from "@/content/ui";
import { formatYearMonth } from "./format";

interface PeriodLabelProps {
  period: Period;
  strings: UiStrings["period"];
  className?: string;
}

export function PeriodLabel({ period, strings, className }: PeriodLabelProps) {
  return (
    <span className={className}>
      <time dateTime={period.start}>{formatYearMonth(period.start, strings.months)}</time>
      {" — "}
      {period.end ? <time dateTime={period.end}>{formatYearMonth(period.end, strings.months)}</time> : strings.present}
    </span>
  );
}
