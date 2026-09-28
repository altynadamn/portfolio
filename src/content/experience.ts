import type { ExperienceEntry } from "./types";

// Numbers only as recorded in the CV / project notes.
export const experience: ExperienceEntry[] = [
  {
    id: "abs-lab",
    organization: "ABS Lab",
    role: "Python Developer — Backend & Integrations",
    period: { start: "2026-04" },
    summary:
      "Client ERP systems: integrations with legacy databases, on-site hardware, 1C and GPS telematics.",
    groups: [
      {
        title: "SMS Road ERP — road-construction company",
        period: { start: "2026-06" },
        highlights: [
          "With one other developer, built a 17‑module system in 3 months. My share: 664 commits (~42%), 81 data entities, 42 reports.",
          "Connected 9 weighing stations with no inbound network access (legacy Firebird, NAT, Starlink): a Python agent pushes data over HTTPS; ingestion is idempotent with natural-key deduplication.",
          "Automated quarry ↔ site trip matching with a backfill of 18,207 records.",
          "Built payroll under Kazakhstan tax law: gross-up from net pay, progressive income tax; all rates live in reference data, not in code.",
          "Closed salary-data leaks between roles with field- and row-level access; sped up heavy reports with EXPLAIN-driven indexes and background jobs.",
          "Integrated 1C payroll (OData) and Wialon via adapters with sync logs and retry of failed rows.",
        ],
      },
      {
        title: "Other client projects",
        highlights: [
          "XTS, field-operations system for telecom operators: found and fixed a silently broken dismantling process — the handler was bound to the wrong event, so work orders never closed.",
          "Data-centre automation, as project lead / analyst: designed a Hikvision turnstile integration (ISAPI) via a push agent and rolled it out on site.",
        ],
      },
    ],
    technologies: ["Python", "Frappe", "MariaDB", "Redis", "Firebird", "OData", "JavaScript", "Linux"],
  },
  {
    id: "smartbid",
    organization: "SmartBid",
    role: "Automation & Backend Engineer",
    period: { start: "2025-10", end: "2026-04" },
    summary: "Automation tools and backend services for marketplace operations.",
    groups: [
      {
        highlights: [
          "Built integrations and product-data sync pipelines with e-commerce platforms.",
          "Deployed and operated services with Docker and k3s across multiple servers.",
          "Set up monitoring and logging to keep long-running automation processes reliable.",
        ],
      },
    ],
    technologies: ["Python", "JavaScript", "PostgreSQL", "Docker", "k3s"],
  },
  {
    id: "crocos",
    organization: "Crocos",
    role: "Backend Developer Intern",
    period: { start: "2025-06", end: "2025-07" },
    summary: "Backend for a school management system.",
    groups: [
      {
        highlights: [
          "Developed backend logic and REST APIs in Python as part of the development team.",
        ],
      },
    ],
    technologies: ["Python", "REST APIs"],
  },
];
