/**
 * Content model. UI components render these; they never hard-code copy.
 * Facts are kept in sync with the CV.
 */

/** ISO-like month, e.g. "2026-04". */
export type YearMonth = `${number}-${string}`;

export interface Period {
  start: YearMonth;
  /** Omitted = present. */
  end?: YearMonth;
}

export interface Link {
  label: string;
  href: string;
  external?: boolean;
}

export interface Metric {
  value: string;
  label: string;
}

export interface ExperienceGroup {
  /** Optional sub-heading, e.g. a product inside a company. */
  title?: string;
  period?: Period;
  highlights: string[];
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  period: Period;
  summary: string;
  groups: ExperienceGroup[];
  technologies: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  period: { start: number; end: number };
  /** Expandable detail; entry is non-expandable when empty. */
  details: string[];
}

export interface StackCategory {
  id: string;
  label: string;
  items: string[];
}

/** Schematic diagrams replace screenshots for NDA work. */
export type ProjectVisual =
  | { kind: "diagram"; id: string }
  | { kind: "image"; src: string; alt: string; width: number; height: number };

export interface Project {
  index: number;
  slug: string;
  title: string;
  tagline: string;
  /** Where the work happened, e.g. "SMS Road ERP · ABS Lab". */
  context: string;
  role: string;
  problem: string;
  approach: string;
  result: string;
  technologies: string[];
  metrics?: Metric[];
  /** Key subsystems of a larger system (flagship projects). */
  subsystems?: { title: string; text: string }[];
  visual?: ProjectVisual;
  confidential?: boolean;
  github?: string;
  live?: string;
  caseStudy?: string;
  year?: number;
}

export interface Section {
  id: string;
  number: string;
  label: string;
  /** Shown in the header navigation. */
  nav?: boolean;
  /** Opener statement, one entry per deliberate display line. */
  statement?: readonly string[];
}

export type Locale = "en" | "ru";

export interface Profile {
  name: string;
  firstName: string;
  role: string;
  discipline: string;
  focus: string[];
  location: { city: string; country: string; timeZone: string };
  email: string;
  languages: { name: string; level: string }[];
}
