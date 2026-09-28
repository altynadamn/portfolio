import type { Locale } from "./types";

/** Russian plural: 1 вклад, 2 вклада, 5 вкладов. */
export function ruPlural(n: number, [one, few, many]: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export interface UiStrings {
  skip: string;
  lang: { label: string };
  hero: { intro: string; hint: string; scroll: string; caption: string; captionMore: string };
  about: { meta: string; greeting: string };
  profile: {
    role: string;
    focus: string;
    location: string;
    email: string;
    localTime: string;
    languages: string;
    links: string;
    newTab: string;
  };
  period: { present: string; months: string[] };
  activity: {
    meta: string;
    contributions: (n: number) => string;
    lastYear: string;
    summary: (n: number) => string;
    sample: string;
    sampleLine1: string;
    sampleLine2: string;
    sampleSummary: string;
    less: string;
    more: string;
    days: [string, string, string];
    date: (iso: string) => string;
  };
  stack: { meta: (categories: number, tools: number) => string };
  experience: { meta: (roles: number, firstYear: number) => string; technologiesAt: (org: string) => string };
  education: { meta: string };
  work: {
    meta: (n: number) => string;
    role: string;
    problem: string;
    approach: string;
    result: string;
    scope: string;
    myPart: string;
    keySubsystems: string;
    nda: string;
    technologies: (title: string) => string;
  };
  contact: { lines: [string, string, string]; note: string };
  footer: { top: string };
  palette: {
    dialog: string;
    label: string;
    placeholder: string;
    nav: string;
    empty: string;
    navigate: string;
    select: string;
    close: string;
  };
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const en: UiStrings = {
  skip: "Skip to content",
  lang: { label: "Language" },
  hero: {
    intro: "Intro",
    hint: "Move the cursor — the noise has structure",
    scroll: "Scroll",
    caption: "Fig. 00 — ZH",
    captionMore: ", oblique projection",
  },
  about: { meta: "Profile", greeting: "Hi, I’m" },
  profile: {
    role: "Role",
    focus: "Focus",
    location: "Location",
    email: "Email",
    localTime: "Local time",
    languages: "Languages",
    links: "Links",
    newTab: "(opens in a new tab)",
  },
  period: { present: "Present", months: MONTHS_EN },
  activity: {
    meta: "GitHub · last 12 months",
    contributions: (n) => (n === 1 ? "contribution" : "contributions"),
    lastYear: "in the last year",
    summary: (n) => `${n.toLocaleString("en-US")} contributions in the last year`,
    sample: "Sample",
    sampleLine1: "illustrative activity",
    sampleLine2: "not live account data",
    sampleSummary: "Illustrative sample contribution activity, not live GitHub account data",
    less: "Less",
    more: "More",
    days: ["Mon", "Wed", "Fri"],
    date: (iso) => {
      const [y, m, d] = iso.split("-");
      return `${MONTHS_EN[Number(m) - 1]} ${Number(d)}, ${y}`;
    },
  },
  stack: { meta: (c, t) => `${c} categories · ${t} tools` },
  experience: {
    meta: (roles, year) => `${roles} roles · ${year} — Present`,
    technologiesAt: (org) => `Technologies used at ${org}`,
  },
  education: { meta: "Degree" },
  work: {
    meta: (n) => `${n} case ${n === 1 ? "study" : "studies"} · Private work`,
    role: "Role",
    problem: "Problem",
    approach: "Approach",
    result: "Result",
    scope: "Scope",
    myPart: "My part",
    keySubsystems: "Key subsystems",
    nda: "Client work — code and screens under NDA",
    technologies: (title) => `${title} technologies`,
  },
  contact: { lines: ["Let’s build", "something", "useful."], note: "Email is the most direct way to reach me." },
  footer: { top: "Back to top" },
  palette: {
    dialog: "Navigate the portfolio",
    label: "Go to section",
    placeholder: "Search sections…",
    nav: "Portfolio sections",
    empty: "No matching sections.",
    navigate: "navigate",
    select: "select",
    close: "close",
  },
};

const ru: UiStrings = {
  skip: "Перейти к содержанию",
  lang: { label: "Язык" },
  hero: {
    intro: "Начало",
    hint: "Наведите курсор — в шуме есть структура",
    scroll: "Вниз",
    caption: "Рис. 00 — ZH",
    captionMore: ", косоугольная проекция",
  },
  about: { meta: "Профиль", greeting: "Привет, я" },
  profile: {
    role: "Роль",
    focus: "Направления",
    location: "Город",
    email: "Почта",
    localTime: "Местное время",
    languages: "Языки",
    links: "Ссылки",
    newTab: "(откроется в новой вкладке)",
  },
  period: { present: "н.в.", months: MONTHS_RU },
  activity: {
    meta: "GitHub · последние 12 месяцев",
    contributions: (n) => ruPlural(n, ["вклад", "вклада", "вкладов"]),
    lastYear: "за последний год",
    summary: (n) => `${n} ${ruPlural(n, ["вклад", "вклада", "вкладов"])} за последний год`,
    sample: "Пример",
    sampleLine1: "иллюстративная активность",
    sampleLine2: "не реальные данные",
    sampleSummary: "Иллюстративный пример активности, не реальные данные GitHub",
    less: "Меньше",
    more: "Больше",
    days: ["Пн", "Ср", "Пт"],
    date: (iso) => {
      const [y, m, d] = iso.split("-");
      return `${Number(d)} ${MONTHS_RU[Number(m) - 1]} ${y}`;
    },
  },
  stack: {
    meta: (c, t) =>
      `${c} ${ruPlural(c, ["категория", "категории", "категорий"])} · ${t} ${ruPlural(t, ["технология", "технологии", "технологий"])}`,
  },
  experience: {
    meta: (roles, year) => `${roles} ${ruPlural(roles, ["место", "места", "мест"])} работы · ${year} — н.в.`,
    technologiesAt: (org) => `Технологии в ${org}`,
  },
  education: { meta: "Высшее образование" },
  work: {
    meta: (n) => `${n} ${ruPlural(n, ["проект", "проекта", "проектов"])} · закрытые проекты`,
    role: "Роль",
    problem: "Задача",
    approach: "Решение",
    result: "Результат",
    scope: "Масштаб",
    myPart: "Моя часть",
    keySubsystems: "Ключевые подсистемы",
    nda: "Клиентская работа — код и экраны под NDA",
    technologies: (title) => `Технологии: ${title}`,
  },
  contact: { lines: ["Давайте", "построим", "что-то полезное."], note: "Быстрее всего — написать на почту." },
  footer: { top: "Наверх" },
  palette: {
    dialog: "Навигация по портфолио",
    label: "Перейти к разделу",
    placeholder: "Поиск разделов…",
    nav: "Разделы портфолио",
    empty: "Ничего не найдено.",
    navigate: "навигация",
    select: "выбрать",
    close: "закрыть",
  },
};

export const UI: Record<Locale, UiStrings> = { en, ru };
