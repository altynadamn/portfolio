import type { SiteContent } from "@/content";
import { Section } from "@/components/layout/Section";
import { TagList } from "@/components/ui/TagList";
import styles from "./Stack.module.css";

/* Dense beat: a technical taxonomy. Asymmetric 4/8 split on desktop. */
export function Stack({ content }: { content: SiteContent }) {
  const { stack, ui, sections } = content;
  const toolCount = stack.reduce((sum, c) => sum + c.items.length, 0);
  return (
    <Section id="stack" sections={sections} meta={ui.stack.meta(stack.length, toolCount)} spacing="dense" flush>
      <div className={styles.layout} data-reveal>
        <ol role="list" className={styles.list}>
          {stack.map((category, i) => (
            <li key={category.id} className={styles.row}>
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.label}>{category.label}</h3>
              <div className={styles.tags}>
                <TagList items={category.items} label={category.label} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
