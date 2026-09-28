import type { Section } from "./types";

// Page order and numbering. `id` is the DOM anchor.
// Statements are display compositions: one entry per deliberate line.
export const sections: Section[] = [
  { id: "intro", number: "00", label: "Intro" },
  { id: "about", number: "01", label: "About", nav: true },
  { id: "activity", number: "02", label: "Activity" },
  { id: "stack", number: "03", label: "Stack" },
  {
    id: "experience",
    number: "04",
    label: "Experience",
    nav: true,
    statement: ["Data that arrives", "complete —", "and without", "duplicates."],
  },
  { id: "education", number: "05", label: "Education" },
  {
    id: "work",
    number: "06",
    label: "Selected Work",
    nav: true,
    statement: ["Projects", "I’ve built", "and worked on."],
  },
  { id: "contact", number: "07", label: "Contact", nav: true },
];
