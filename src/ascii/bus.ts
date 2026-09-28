/*
 * Thin bridge between React UI and the Canvas engine. UI code never touches
 * particles — it only asks for a formation, a dissolution or a pulse.
 * Every call is a safe no-op when no engine is running
 * (reduced motion, Canvas failure, SSR): content simply stays visible.
 */

export interface AsciiEngineApi {
  /** Particles converge into the element's text, then the HTML fades in. */
  form(element: HTMLElement): boolean;
  /** The element's text breaks apart back into the field. */
  dissolve(element: HTMLElement): boolean;
  /** Small local disturbance (hover feedback) at viewport coordinates. */
  pulse(x: number, y: number): void;
}

let engine: AsciiEngineApi | null = null;

export function registerAsciiEngine(api: AsciiEngineApi | null) {
  engine = api;
}

export const ascii = {
  get active() {
    return engine !== null;
  },
  form: (element: HTMLElement) => engine?.form(element) ?? false,
  dissolve: (element: HTMLElement) => engine?.dissolve(element) ?? false,
  pulse: (x: number, y: number) => engine?.pulse(x, y),
  /** Pulse at the centre of an element. */
  pulseAt(element: Element) {
    if (!engine) return;
    const r = element.getBoundingClientRect();
    engine.pulse(r.left + r.width / 2, r.top + r.height / 2);
  },
};
