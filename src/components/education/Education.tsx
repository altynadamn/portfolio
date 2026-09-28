import type { SiteContent } from "@/content";
import { Section } from "@/components/layout/Section";
import { Disclosure } from "@/components/ui/Disclosure";
import { EntryHeading, StaticEntry } from "@/components/ui/EntryHeading";
import styles from "./Education.module.css";

export function Education({ content }: { content: SiteContent }) {
  const { education, ui, sections } = content;
  return (
    <Section id="education" sections={sections} meta={ui.education.meta} spacing="dense" flush>
      <div data-reveal>
        {education.map((entry, i) => {
          const heading = (
            <EntryHeading
              index={String(i + 1).padStart(2, "0")}
              title={entry.institution}
              subtitle={entry.degree}
              period={
                <>
                  <time dateTime={String(entry.period.start)}>{entry.period.start}</time>
                  {" — "}
                  <time dateTime={String(entry.period.end)}>{entry.period.end}</time>
                </>
              }
            />
          );

          if (entry.details.length === 0) {
            return (
              <StaticEntry key={entry.id}>
                <h3 className={styles.contents}>{heading}</h3>
              </StaticEntry>
            );
          }

          return (
            <Disclosure key={entry.id} id={`education-${entry.id}`} heading={heading}>
              <ul role="list" className={styles.details}>
                {entry.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Disclosure>
          );
        })}
      </div>
    </Section>
  );
}
