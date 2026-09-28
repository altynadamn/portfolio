import type { Project } from "./types";

// Commercial work is under NDA: no screenshots, repository or live links.
// Numbers only as recorded in the source notes.
export const projects: Project[] = [
  {
    index: 1,
    slug: "sms-road-erp",
    title: "SMS Road ERP",
    tagline: "A 17-module ERP for a road-construction company, built by two developers in three months.",
    context: "ABS Lab · Jun — Sep",
    role: "Backend developer, one of two",
    problem:
      "One system for the whole company: projects and sites, weighbridges, HR and payroll, machinery, fuel, maintenance, procurement, payments and BI — connected to legacy weighbridge databases, 1C and GPS telematics.",
    approach:
      "A Frappe v16 monorepo of three apps. I owned the platform core — the project/site model, role scoping, the projects map and the mobile API contract — plus the weighbridge, procurement, payments and BI modules, and closed large parts of HR/payroll and the machinery modules.",
    result:
      "Six releases in three months. My share: 664 of 1,571 commits (~42%), 81 data entities, 42 reports and 66 data-migration patches.",
    technologies: ["Python", "Frappe", "MariaDB", "Redis", "JavaScript", "Firebird", "OData", "Leaflet"],
    metrics: [
      { value: "17", label: "modules" },
      { value: "664", label: "commits · ~42%" },
      { value: "81", label: "data entities" },
      { value: "42", label: "reports" },
    ],
    subsystems: [
      {
        title: "Weighbridge integration",
        text: "9 stations on legacy Firebird, behind NAT on Starlink. A Windows push agent sends data over HTTPS; ingestion is idempotent with natural-key deduplication. Quarry ↔ site trip matching backfilled 18,207 records.",
      },
      {
        title: "HR & payroll",
        text: "Kazakhstan payroll: gross-up from net pay, progressive income tax, exemptions for pensioners, students and non-residents — every rate in reference data. Timesheet matrix with project-manager approval.",
      },
      {
        title: "Access control",
        text: "Role, project and site scoping enforced even on raw-SQL reports; salary-data leaks between roles closed; permission presets so a non-programmer admin can grant access.",
      },
      {
        title: "Integrations",
        text: "1C payroll and fixed assets over OData, Wialon GPS telemetry — adapters with per-row sync logs, retry of failed rows and master fields locked against manual edits.",
      },
      {
        title: "Projects map",
        text: "Leaflet map layering projects, weighbridges, GPS-tracked machinery, plants and quarries; site coordinates backfilled from weighbridge and Wialon data.",
      },
      {
        title: "Mobile API",
        text: "API contract for a Flutter client: idempotent document creation by client UUID, workflow actions, an OpenAPI spec with a public Swagger page.",
      },
    ],
    confidential: true,
    year: 2026,
  },
  {
    index: 2,
    slug: "steppe-sims",
    title: "Steppe SIMS",
    tagline: "Social media monitoring — the Telegram side.",
    context: "Team project with a senior developer",
    role: "Owned the Telegram integration",
    problem:
      "Monitor news across social platforms, score sentiment and criticality, and alert the right people quickly.",
    approach:
      "Data collection from Telegram with Telethon, and an alert bot on FastAPI that delivers flagged items to selected recipients.",
    result: "Telegram wired into the monitoring pipeline end to end — from collection to alerts.",
    technologies: ["Python", "FastAPI", "Telethon"],
    confidential: true,
  },
];
