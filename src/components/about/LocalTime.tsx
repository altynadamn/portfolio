"use client";

import { useSyncExternalStore } from "react";
import styles from "./ProfilePanel.module.css";

// One shared minute ticker; the component re-renders at most once per minute.
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, 60_000 - (Date.now() % 60_000));
  };
  schedule();
  return () => clearTimeout(timer);
}

const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/** "GMT+5" / "GMT-3:30" → minutes east of UTC. */
function offsetMinutes(label: string): number {
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(label);
  if (!m) return 0;
  const minutes = Number(m[2]) * 60 + Number(m[3] ?? 0);
  return m[1] === "-" ? -minutes : minutes;
}

/** "10:46 PM // 2h ahead" (en) · "21:07 // на 2 ч впереди" (ru) — relative to the visitor's zone. */
export function LocalTime({ timeZone, locale = "en" }: { timeZone: string; locale?: "en" | "ru" }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);

  if (minute === null) {
    return <span aria-hidden="true">--:--</span>;
  }

  const date = new Date(minute * 60_000);
  const ru = locale === "ru";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: ru ? "2-digit" : "numeric",
    minute: "2-digit",
    hourCycle: ru ? "h23" : "h12",
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const time = parts
    .filter((p) => p.type === "hour" || p.type === "minute" || p.type === "dayPeriod" || p.type === "literal")
    .map((p) => p.value)
    .join("")
    .replace(/\s+$/, "")
    .replace(/\s*GMT.*$/, "");
  const there = offsetMinutes(parts.find((p) => p.type === "timeZoneName")?.value ?? "");
  const here = -date.getTimezoneOffset();
  const diffHours = Math.round(((there - here) / 60) * 10) / 10;
  const hours = Math.abs(diffHours);
  const relation = ru
    ? diffHours === 0
      ? "то же время"
      : `на ${hours} ч ${diffHours > 0 ? "впереди" : "позади"}`
    : diffHours === 0
      ? "same time"
      : `${hours}h ${diffHours > 0 ? "ahead" : "behind"}`;

  return (
    <time dateTime={date.toISOString()}>
      {time} <span className={styles.offset}>{`// ${relation}`}</span>
    </time>
  );
}
