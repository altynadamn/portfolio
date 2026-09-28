import styles from "./SiteFooter.module.css";

export function SiteFooter({ label }: { label: string }) {
  return (
    <footer className={styles.footer}>
      <a href="#intro" className={styles.top}>
        {label} <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
