import type { EducationEntry, ExperienceEntry, Profile, Project, Section, StackCategory } from "./types";

/*
 * Russian content: same facts and numbers as the English version.
 */

export const profileRu: Profile = {
  name: "Zhomart Begaly",
  firstName: "Жомарт",
  role: "Инженер-программист",
  discipline: "backend и интеграции",
  focus: ["Backend", "Системы", "Автоматизация"],
  location: { city: "Астана", country: "Казахстан", timeZone: "Asia/Almaty" },
  email: "zhomart.begaly@gmail.com",
  languages: [
    { name: "Казахский", level: "родной" },
    { name: "Русский", level: "свободно" },
    { name: "Английский", level: "C1" },
  ],
};

export const experienceRu: ExperienceEntry[] = [
  {
    id: "abs-lab",
    organization: "ABS Lab",
    role: "Python-разработчик — backend и интеграции",
    period: { start: "2026-04" },
    summary: "ERP-системы для клиентов: интеграции с legacy-базами, оборудованием на объектах, 1С и GPS-телематикой.",
    groups: [
      {
        title: "SMS Road ERP — система для дорожно-строительной компании",
        period: { start: "2026-06" },
        highlights: [
          "Вдвоём со вторым разработчиком за 3 месяца построили систему из 17 модулей; мой вклад — 664 коммита (~42%), 81 сущность данных, 42 отчёта.",
          "Подключил 9 весовых станций без входящего сетевого доступа (legacy Firebird, NAT, Starlink): написал Python-агент, который сам отправляет данные по HTTPS; приём идемпотентный, с дедупликацией по натуральному ключу.",
          "Автоматизировал сопоставление рейсов карьер ↔ объект с бэкфиллом 18 207 записей.",
          "Реализовал расчёт зарплаты по законодательству РК: gross-up от суммы «на руки», прогрессивный ИПН; все ставки — в справочниках, а не в коде.",
          "Закрыл утечки зарплатных данных между ролями (доступ на уровне полей и строк); ускорил тяжёлые отчёты индексами по EXPLAIN и фоновыми задачами.",
          "Интегрировал ЗУП (OData) и Wialon через адаптеры с логом синхронизации и повтором упавших строк.",
        ],
      },
      {
        title: "Другие проекты",
        highlights: [
          "XTS (система полевых работ для операторов связи): нашёл и починил молча сломанный процесс «Демонтаж» — обработчик висел на неверном событии, наряды не закрывались.",
          "Автоматизация ЦОД (руководитель проекта / аналитик): спроектировал интеграцию турникета Hikvision (ISAPI) через push-агент и внедрил её на объекте.",
        ],
      },
    ],
    technologies: ["Python", "Frappe", "MariaDB", "Redis", "Firebird", "OData", "JavaScript", "Linux"],
  },
  {
    id: "smartbid",
    organization: "SmartBid",
    role: "Automation & Backend Engineer",
    period: { start: "2025-10", end: "2026-04" },
    summary: "Инструменты автоматизации и backend-сервисы для операций на маркетплейсах.",
    groups: [
      {
        highlights: [
          "Строил интеграции и пайплайны синхронизации товарных данных с e-commerce платформами.",
          "Разворачивал и сопровождал сервисы в Docker и k3s на нескольких серверах.",
          "Внедрил мониторинг и логирование, чтобы долгоживущие процессы автоматизации работали стабильно.",
        ],
      },
    ],
    technologies: ["Python", "JavaScript", "PostgreSQL", "Docker", "k3s"],
  },
  {
    id: "crocos",
    organization: "Crocos",
    role: "Стажёр, backend",
    period: { start: "2025-06", end: "2025-07" },
    summary: "Backend для системы управления школой.",
    groups: [{ highlights: ["Разрабатывал backend-логику и REST API на Python в составе команды."] }],
    technologies: ["Python", "REST APIs"],
  },
];

export const educationRu: EducationEntry[] = [
  {
    id: "aitu",
    institution: "Astana IT University",
    degree: "Бакалавр, Computer Science",
    period: { start: 2023, end: 2026 },
    details: [],
  },
];

export const stackRu: StackCategory[] = [
  { id: "languages", label: "Языки", items: ["Python", "Go", "SQL", "JavaScript"] },
  { id: "backend", label: "Backend", items: ["FastAPI", "Django", "Frappe", "Supabase"] },
  { id: "data", label: "Данные", items: ["PostgreSQL", "MariaDB", "Redis", "Firebird"] },
  {
    id: "integrations",
    label: "Интеграции",
    items: ["1C (OData)", "Wialon API", "Hikvision ISAPI", "Telegram Bot API", "Telethon"],
  },
  { id: "infrastructure", label: "Инфраструктура", items: ["Docker", "k3s", "Linux", "Nginx", "Git", "Tailscale"] },
];

export const sectionsRu: Section[] = [
  { id: "intro", number: "00", label: "Начало" },
  { id: "about", number: "01", label: "Обо мне", nav: true },
  { id: "activity", number: "02", label: "Активность" },
  { id: "stack", number: "03", label: "Стек" },
  {
    id: "experience",
    number: "04",
    label: "Опыт",
    nav: true,
    statement: ["Данные, которые", "доходят полностью —", "и без", "дублей."],
  },
  { id: "education", number: "05", label: "Образование" },
  {
    id: "work",
    number: "06",
    label: "Проекты",
    nav: true,
    statement: ["Проекты,", "над которыми", "я работал."],
  },
  { id: "contact", number: "07", label: "Контакты", nav: true },
];

export const projectsRu: Project[] = [
  {
    index: 1,
    slug: "sms-road-erp",
    title: "SMS Road ERP",
    tagline: "ERP из 17 модулей для дорожно-строительной компании — вдвоём за три месяца.",
    context: "ABS Lab · июнь — сент.",
    role: "Backend-разработчик, один из двух",
    problem:
      "Одна система на всю компанию: проекты и участки, весовые, кадры и зарплата, техника, ГСМ, ТО, закупки, платежи и BI — с интеграцией legacy-баз весовых, 1С и GPS-телематики.",
    approach:
      "Монорепо из трёх приложений на Frappe v16. На мне — платформенное ядро (модель проект/участок, разграничение доступа, карта проектов, контракт мобильного API), модули весовой, закупок, платежей и BI; также закрывал большие части кадров, зарплаты и модулей техники.",
    result:
      "Шесть релизов за три месяца. Мой вклад: 664 из 1571 коммита (~42%), 81 сущность данных, 42 отчёта и 66 патчей миграции данных.",
    technologies: ["Python", "Frappe", "MariaDB", "Redis", "JavaScript", "Firebird", "OData", "Leaflet"],
    metrics: [
      { value: "17", label: "модулей" },
      { value: "664", label: "коммита · ~42%" },
      { value: "81", label: "сущность данных" },
      { value: "42", label: "отчёта" },
    ],
    subsystems: [
      {
        title: "Интеграция весовых",
        text: "9 станций на legacy Firebird за NAT и Starlink. Windows-агент сам отправляет данные по HTTPS; приём идемпотентный, с дедупликацией по натуральному ключу. Сопоставление рейсов карьер ↔ объект — бэкфилл 18 207 записей.",
      },
      {
        title: "Кадры и зарплата",
        text: "Зарплата по законодательству РК: gross-up от суммы «на руки», прогрессивный ИПН, льготы для пенсионеров, студентов и нерезидентов — все ставки в справочниках. Табель-матрица с визой руководителя проекта.",
      },
      {
        title: "Разграничение доступа",
        text: "Скоупинг по роли, проекту и участку — даже в raw-SQL отчётах; закрыты утечки зарплатных данных между ролями; пресеты прав, чтобы доступы выдавал администратор без программиста.",
      },
      {
        title: "Интеграции",
        text: "ЗУП и основные средства 1С через OData, телеметрия Wialon — адаптеры с построчным логом синхронизации, повтором упавших строк и защитой мастер-полей от ручной правки.",
      },
      {
        title: "Карта проектов",
        text: "Карта на Leaflet: проекты, весовые, техника по GPS, заводы и карьеры; координаты участков восстановлены из данных весовых и Wialon.",
      },
      {
        title: "Мобильный API",
        text: "Контракт API для Flutter-клиента: идемпотентное создание документов по client_uuid, действия Workflow, OpenAPI-спека и публичная страница Swagger.",
      },
    ],
    confidential: true,
    year: 2026,
  },
  {
    index: 2,
    slug: "steppe-sims",
    title: "Steppe SIMS",
    tagline: "Мониторинг соцсетей — Telegram-контур.",
    context: "Командный проект со старшим разработчиком",
    role: "Отвечал за интеграцию с Telegram",
    problem: "Отслеживать новости в соцсетях, оценивать тональность и критичность и быстро оповещать нужных людей.",
    approach:
      "Сбор данных из Telegram через Telethon и бот оповещений на FastAPI, который отправляет отмеченные материалы выбранным получателям.",
    result: "Telegram встроен в систему мониторинга целиком — от сбора до оповещений.",
    technologies: ["Python", "FastAPI", "Telethon"],
    confidential: true,
  },
];
