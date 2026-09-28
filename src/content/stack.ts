import type { StackCategory } from "./types";

// Concrete technologies only — no percentages, no vague capabilities.
export const stack: StackCategory[] = [
  { id: "languages", label: "Languages", items: ["Python", "Go", "SQL", "JavaScript"] },
  { id: "backend", label: "Backend", items: ["FastAPI", "Django", "Frappe", "Supabase"] },
  { id: "data", label: "Data", items: ["PostgreSQL", "MariaDB", "Redis", "Firebird"] },
  {
    id: "integrations",
    label: "Integrations",
    items: ["1C (OData)", "Wialon API", "Hikvision ISAPI", "Telegram Bot API", "Telethon"],
  },
  { id: "infrastructure", label: "Infrastructure", items: ["Docker", "k3s", "Linux", "Nginx", "Git", "Tailscale"] },
];
