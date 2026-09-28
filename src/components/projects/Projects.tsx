import type { SiteContent } from "@/content";
import type { Project } from "@/content/types";
import type { UiStrings } from "@/content/ui";
import { Section } from "@/components/layout/Section";
import { TagList } from "@/components/ui/TagList";
import { emphasizeNumbers } from "@/components/ui/emphasizeNumbers";
import styles from "./Projects.module.css";

export function Projects({ content }: { content: SiteContent }) {
  const { projects, ui, sections } = content;
  return (
    <Section id="work" sections={sections} meta={ui.work.meta(projects.length)} opener flush>
      <div className={styles.list}>
        {projects.map((project) => (
          <ProjectShowcase key={project.slug} project={project} ui={ui} />
        ))}
      </div>
    </Section>
  );
}

function ProjectShowcase({ project, ui }: { project: Project; ui: UiStrings }) {
  const t = ui.work;
  const number = String(project.index).padStart(2, "0");
  const headingId = `project-${project.slug}`;
  const reversed = project.index % 2 === 0;

  return (
    <article aria-labelledby={headingId} className={`${styles.project} ${reversed ? styles.reversed : ""}`}>
      <header className={styles.bar}>
        <span>
          <span className={styles.barIndex}>{number}</span> / {project.title}
        </span>
        <span className={styles.barMeta}>
          {project.context}
          {project.year ? ` · ${project.year}` : ""}
        </span>
      </header>

      <div className={`${styles.body} ${project.subsystems?.length ? styles.withSubsystems : ""}`} data-reveal>
        <div className={styles.intro}>
          <span className={styles.numeral} aria-hidden="true">
            {number}
          </span>
          <h3 id={headingId} className={styles.title}>
            {project.title}
          </h3>
          <p className={styles.tagline}>{project.tagline}</p>
          <p className={styles.role}>
            <span className={styles.roleLabel}>{t.role}</span> {project.role}
          </p>
        </div>

        <dl className={styles.facts}>
          {(
            [
              [project.subsystems ? t.scope : t.problem, project.problem],
              [project.subsystems ? t.myPart : t.approach, project.approach],
              [t.result, project.result],
            ] as const
          ).map(([label, text]) => (
            <div key={label} className={styles.fact}>
              <dt className={styles.factLabel}>{label}</dt>
              <dd className={styles.factText}>{emphasizeNumbers(text, styles.number)}</dd>
            </div>
          ))}
        </dl>

        {project.subsystems?.length ? (
          <div className={styles.subsystems}>
            <p className={styles.subsystemsLabel}>{t.keySubsystems}</p>
            <ol role="list" className={styles.subsystemList}>
              {project.subsystems.map((sub, i) => (
                <li key={sub.title} className={styles.subsystem}>
                  <span className={styles.subsystemIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className={styles.subsystemTitle}>{sub.title}</h4>
                  <p className={styles.subsystemText}>{emphasizeNumbers(sub.text, styles.number)}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <footer className={styles.footer}>
          {project.metrics?.length ? (
            <dl className={styles.metrics}>
              {project.metrics.map((m) => (
                <div key={m.label} className={styles.metric}>
                  <dt className={styles.metricLabel}>{m.label}</dt>
                  <dd className={styles.metricValue}>{m.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <TagList items={project.technologies} label={t.technologies(project.title)} />
          <ProjectLinks project={project} ui={ui} />
        </footer>
      </div>
    </article>
  );
}

function ProjectLinks({ project, ui }: { project: Project; ui: UiStrings }) {
  const links = [
    project.github && { label: "GitHub", href: project.github },
    project.live && { label: "Live", href: project.live },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  if (links.length === 0) {
    return project.confidential ? <p className={styles.private}>{ui.work.nda}</p> : null;
  }

  return (
    <ul role="list" className={styles.links}>
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="noreferrer" className={styles.link}>
            {l.label} <span aria-hidden="true">↗</span>
            <span className="sr-only"> — {project.title} {ui.profile.newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
