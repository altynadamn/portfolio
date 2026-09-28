"use client";

import { useEffect, useRef, useState } from "react";
import type { Section } from "@/content/types";
import type { UiStrings } from "@/content/ui";
import { OPEN_COMMAND_PALETTE_EVENT } from "./CommandHint";
import styles from "./CommandPalette.module.css";

export function CommandPalette({ sections, strings }: { sections: Section[]; strings: UiStrings["palette"] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => {
      setQuery("");
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, show);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, show);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const matches = sections.filter((section) => section.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={strings.dialog}
      onCancel={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className={styles.panel}>
        <label className={styles.searchLabel} htmlFor="command-search">{strings.label}</label>
        <input
          ref={inputRef}
          id="command-search"
          className={styles.search}
          type="search"
          placeholder={strings.placeholder}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              dialogRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${matches[0]?.id}"]`)?.focus();
            }
          }}
        />
        <nav aria-label={strings.nav}>
          <ul
            className={styles.list}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
              const index = links.indexOf(document.activeElement as HTMLAnchorElement);
              const next = event.key === "ArrowDown" ? links[index + 1] : links[index - 1];
              if (next) {
                event.preventDefault();
                next.focus();
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                inputRef.current?.focus();
              }
            }}
          >
            {matches.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} onClick={() => setOpen(false)}>
                  <span>{section.label}</span><span aria-hidden="true">{section.number}</span>
                </a>
              </li>
            ))}
          </ul>
          {matches.length === 0 ? <p className={styles.empty}>{strings.empty}</p> : null}
        </nav>
        <p className={styles.hint}><kbd>↑</kbd><kbd>↓</kbd> {strings.navigate} <kbd>Enter</kbd> {strings.select} <kbd>Esc</kbd> {strings.close}</p>
      </div>
    </dialog>
  );
}
