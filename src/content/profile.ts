import type { Profile } from "./types";

export const profile: Profile = {
  name: "Zhomart Begaly",
  firstName: "Zhomart",
  // Positioning per user (2026-09-28); the CV headline stays "Python Developer".
  role: "Software Engineer",
  discipline: "Backend & Integrations",
  focus: ["Backend", "Systems", "Automation"],
  location: {
    city: "Astana",
    country: "Kazakhstan",
    /** Astana shares the Asia/Almaty zone (UTC+5 since 2024). */
    timeZone: "Asia/Almaty",
  },
  email: "zhomart.begaly@gmail.com",
  languages: [
    { name: "Kazakh", level: "Native" },
    { name: "Russian", level: "Fluent" },
    { name: "English", level: "C1" },
  ],
};
