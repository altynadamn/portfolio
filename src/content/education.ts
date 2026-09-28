import type { EducationEntry } from "./types";

export const education: EducationEntry[] = [
  {
    id: "aitu",
    institution: "Astana IT University",
    degree: "B.Sc. in Computer Science",
    period: { start: 2023, end: 2026 },
    // No verified detail in the vault yet — renders as a non-expandable row.
    details: [],
  },
];
