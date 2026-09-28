import type { Link } from "./types";
import { profile } from "./profile";

export const GITHUB_USERNAME = "altynadamn";

export const LINKEDIN_URL =
  "https://www.linkedin.com/in/%D0%B6%D0%BE%D0%BC%D0%B0%D1%80%D1%82-%D0%B1%D0%B5%D0%B3%D0%B0%D0%BB%D1%8B-949656383/";

export const socials: Link[] = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "GitHub", href: `https://github.com/${GITHUB_USERNAME}`, external: true },
  { label: "LinkedIn", href: LINKEDIN_URL, external: true },
];
