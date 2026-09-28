import styles from "./TagList.module.css";

export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul role="list" aria-label={label} className={styles.list}>
      {items.map((item) => (
        <li key={item} className={styles.tag}>
          {item}
        </li>
      ))}
    </ul>
  );
}
