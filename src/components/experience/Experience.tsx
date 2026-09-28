import type { SiteContent } from "@/content";
import type { ExperienceEntry } from "@/content/types";
import type { UiStrings } from "@/content/ui";
import { Section } from "@/components/layout/Section";
import { Disclosure } from "@/components/ui/Disclosure";
import { EntryHeading } from "@/components/ui/EntryHeading";
import { PeriodLabel } from "@/components/ui/PeriodLabel";
import { TagList } from "@/components/ui/TagList";
import { emphasizeNumbers } from "@/components/ui/emphasizeNumbers";
import styles from "./Experience.module.css";

export function Experience({ content }: { content: SiteContent }) {
  const { experience, ui, sections } = content;
  const firstYear = Math.min(...experience.map((e) => Number(e.period.start.slice(0, 4))));
  return (
    <Section
      id="experience"
      sections={sections}
      meta={ui.experience.meta(experience.length, firstYear)}
      spacing="dense"
      flush
    >
      <div data-reveal>
        {experience.map((entry, i) => (
          <Disclosure
            key={entry.id}
            id={`experience-${entry.id}`}
            heading={
              <EntryHeading
                index={String(i + 1).padStart(2, "0")}
                title={entry.organization}
                subtitle={entry.role}
                period={<PeriodLabel period={entry.period} strings={ui.period} />}
              />
            }
          >
            <ExperienceDetails entry={entry} ui={ui} />
          </Disclosure>
        ))}
      </div>
    </Section>
  );
}

function ExperienceDetails({ entry, ui }: { entry: ExperienceEntry; ui: UiStrings }) {
  return (
    <div className={styles.details}>
      <p className={styles.summary} data-formation={`experience-${entry.id}`}>
        {entry.summary}
      </p>

      {entry.groups.map((group, i) => (
        <div key={group.title ?? i} className={styles.group}>
          {group.title ? (
            <p className={styles.groupTitle}>
              <span>{group.title}</span>
              {group.period ? <PeriodLabel period={group.period} strings={ui.period} className={styles.groupPeriod} /> : null}
            </p>
          ) : null}
          <ul role="list" className={styles.highlights}>
            {group.highlights.map((text) => (
              <li key={text}>{emphasizeNumbers(text, styles.number)}</li>
            ))}
          </ul>
        </div>
      ))}

      <TagList items={entry.technologies} label={ui.experience.technologiesAt(entry.organization)} />
    </div>
  );
}
