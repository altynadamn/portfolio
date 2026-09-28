import { education } from "./education";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { educationRu, experienceRu, profileRu, projectsRu, sectionsRu, stackRu } from "./ru";
import { sections } from "./sections";
import { stack } from "./stack";
import type { EducationEntry, ExperienceEntry, Locale, Profile, Project, Section, StackCategory } from "./types";
import { UI, type UiStrings } from "./ui";

export interface SiteContent {
  locale: Locale;
  profile: Profile;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: Project[];
  stack: StackCategory[];
  sections: Section[];
  ui: UiStrings;
}

const CONTENT: Record<Locale, SiteContent> = {
  en: { locale: "en", profile, experience, education, projects, stack, sections, ui: UI.en },
  ru: {
    locale: "ru",
    profile: profileRu,
    experience: experienceRu,
    education: educationRu,
    projects: projectsRu,
    stack: stackRu,
    sections: sectionsRu,
    ui: UI.ru,
  },
};

export const LOCALES: Locale[] = ["en", "ru"];
export const LOCALE_PATH: Record<Locale, string> = { en: "/", ru: "/ru" };

export function getContent(locale: Locale): SiteContent {
  return CONTENT[locale];
}
