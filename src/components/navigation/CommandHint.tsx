"use client";

import { useSyncExternalStore } from "react";

/** Fired on window; the command palette (CMD-001) listens for it. */
export const OPEN_COMMAND_PALETTE_EVENT = "command-palette:open";

const noopSubscribe = () => () => {};
const isApplePlatform = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export function CommandHint({ className }: { className?: string }) {
  const apple = useSyncExternalStore(noopSubscribe, isApplePlatform, () => false);

  return (
    <button
      type="button"
      className={className}
      aria-label="Open command palette"
      aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
    >
      <kbd>{apple ? "⌘" : "Ctrl"}</kbd>
      <kbd>K</kbd>
    </button>
  );
}
