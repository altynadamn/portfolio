/*
 * GitHub contribution calendar.
 * Real data: GitHub GraphQL, server-side, requires GITHUB_TOKEN, revalidated daily.
 * Otherwise (no token, API failure): deterministic FALLBACK data so the section
 * always renders. `source` tells the UI which one it got.
 */

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionCalendar {
  /** Columns of 7 days (Sun → Sat). Leading/trailing days may be null. */
  weeks: (ContributionDay | null)[][];
  total: number;
  source: "github" | "fallback";
}

const LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
  }
}`;

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string; weekday: number }[] }[];
        };
      };
    };
  };
}

export async function getContributions(login: string): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: QUERY, variables: { login } }),
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(6_000),
      });
      const json = (await res.json()) as GraphQLResponse;
      const cal = json.data?.user?.contributionsCollection.contributionCalendar;
      if (res.ok && cal) {
        const weeks = cal.weeks.map((w) => {
          const col: (ContributionDay | null)[] = Array(7).fill(null);
          for (const d of w.contributionDays) {
            col[d.weekday] = { date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 };
          }
          return col;
        });
        return { weeks, total: cal.totalContributions, source: "github" };
      }
    } catch {
      // Fall through to the fallback calendar.
    }
  }
  // No token: the public contributions page (same data as the profile graph).
  const publicCalendar = await fetchPublicCalendar(login);
  if (publicCalendar) return publicCalendar;
  return fallbackCalendar();
}

/*
 * Token-free real data: parses https://github.com/users/<login>/contributions
 * (server-side, revalidated daily). Cells carry data-date/data-level and an id
 * "contribution-day-component-<weekday>-<week>"; counts live in <tool-tip>s.
 * Returns null on any failure so the caller can fall back.
 */
async function fetchPublicCalendar(login: string): Promise<ContributionCalendar | null> {
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions`, {
      headers: { "User-Agent": "zhomart.dev portfolio", Accept: "text/html" },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const counts = new Map<string, number>();
    for (const m of html.matchAll(/for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = /^(\d[\d,]*) contributions?/.exec(m[2].trim());
      counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
    }

    const weeks: (ContributionDay | null)[][] = [];
    let total = 0;
    for (const m of html.matchAll(/<td\b[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
      const tag = m[0];
      const date = /data-date="([\d-]+)"/.exec(tag)?.[1];
      const id = /id="contribution-day-component-(\d+)-(\d+)"/.exec(tag);
      if (!date || !id) continue;
      const weekday = Number(id[1]);
      const week = Number(id[2]);
      const count = counts.get(`contribution-day-component-${weekday}-${week}`) ?? 0;
      const level = Math.min(4, Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0)) as ContributionLevel;
      total += count;
      (weeks[week] ??= Array<ContributionDay | null>(7).fill(null))[weekday] = { date, count, level };
    }
    for (let i = 0; i < weeks.length; i++) weeks[i] ??= Array<ContributionDay | null>(7).fill(null);
    if (weeks.length < 10) return null;
    return { weeks, total, source: "github" };
  } catch {
    return null;
  }
}

/* ── FALLBACK (not real activity) ─────────────────────────────────── */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function levelFor(count: number): ContributionLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function fallbackCalendar(): ContributionCalendar {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // back to Sunday

  const random = rng(20260928);
  const weeks: (ContributionDay | null)[][] = [];
  let total = 0;

  for (let w = 0; w < 53; w++) {
    // Work comes in waves: busy project phases and quiet weeks.
    const wave = 0.55 + 0.45 * Math.sin(w / 4.2) * Math.cos(w / 9.5);
    const quietWeek = random() < 0.08;
    const col: (ContributionDay | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + w * 7 + d);
      if (date > today) {
        col.push(null);
        continue;
      }
      const weekend = d === 0 || d === 6;
      const active = !quietWeek && random() < (weekend ? 0.22 : 0.78) * (0.55 + wave * 0.6);
      const count = active ? Math.max(1, Math.round(random() * 11 * wave + random() * 3)) : 0;
      total += count;
      col.push({ date: date.toISOString().slice(0, 10), count, level: levelFor(count) });
    }
    weeks.push(col);
  }
  return { weeks, total, source: "fallback" };
}
