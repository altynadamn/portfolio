import { getContributions } from "@/lib/github";
import type { SiteContent } from "@/content";
import { GITHUB_USERNAME } from "@/content/socials";
import { Section } from "@/components/layout/Section";
import { GitHubIcon } from "@/components/ui/icons";
import styles from "./Activity.module.css";

/* Dense beat: the contribution field is the visual anchor of the section. */
export async function Activity({ content }: { content: SiteContent }) {
  const { ui, sections } = content;
  const t = ui.activity;
  const MONTHS = ui.period.months;
  const calendar = await getContributions(GITHUB_USERNAME);
  const { weeks, total } = calendar;

  // Month label on the first week that starts in a new month.
  const monthLabels: { col: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    const first = week.find(Boolean);
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    const prev = monthLabels[monthLabels.length - 1];
    if ((!prev || MONTHS[month] !== prev.label) && (!prev || i - prev.col >= 3)) {
      monthLabels.push({ col: i, label: MONTHS[month] });
    }
  });

  const isFallback = calendar.source === "fallback";
  const summary = isFallback ? t.sampleSummary : t.summary(total);

  return (
    <Section id="activity" sections={sections} meta={t.meta} spacing="dense" flush>
      <div className={styles.wrap} data-reveal data-source={calendar.source}>
        <p className={styles.total}>
          <span className={`${styles.totalValue} ${isFallback ? styles.sampleValue : ""}`}>
            {isFallback ? t.sample : total.toLocaleString("en-US")}
          </span>
          <span className={styles.totalLabel}>
            {isFallback ? t.sampleLine1 : t.contributions(total)}
            <br />
            {isFallback ? t.sampleLine2 : t.lastYear}
          </span>
        </p>

        <div className={styles.scroller}>
          <div className={styles.calendar} style={{ ["--weeks" as string]: weeks.length }}>
            <div className={styles.months} aria-hidden="true">
              {monthLabels.map((m) => (
                <span key={`${m.col}-${m.label}`} style={{ gridColumn: `${m.col + 1} / span 3` }}>
                  {m.label}
                </span>
              ))}
            </div>
            <div className={styles.days} aria-hidden="true">
              <span style={{ gridRow: 2 }}>{t.days[0]}</span>
              <span style={{ gridRow: 4 }}>{t.days[1]}</span>
              <span style={{ gridRow: 6 }}>{t.days[2]}</span>
            </div>
            <div className={styles.grid} role="img" aria-label={summary}>
              {weeks.map((week, w) =>
                week.map((day, d) =>
                  // Compact markup (371 cells, repeated in the RSC payload): no
                  // per-cell class; styled via the grid. data-t = tooltip text.
                  day ? (
                    <span key={`${w}-${d}`} data-l={day.level} data-t={`${day.count} · ${t.date(day.date)}`} />
                  ) : (
                    <span key={`${w}-${d}`} />
                  ),
                ),
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.legend} aria-hidden="true">
            <span>{t.less}</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className={styles.swatch} data-l={l} />
            ))}
            <span>{t.more}</span>
          </div>
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" className={styles.link}>
            <GitHubIcon />
            github.com/{GITHUB_USERNAME}
            <span aria-hidden="true" className={styles.arrow}>
              ↗
            </span>
            <span className="sr-only"> {ui.profile.newTab}</span>
          </a>
        </div>
      </div>
    </Section>
  );
}
