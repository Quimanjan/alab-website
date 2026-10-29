// Tiny event bus for visual effects, so any component can trigger embers.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

/** Ember burst at a screen point. */
export function burst(x, y, { count = 40, power = 1, spread = Math.PI * 2, angle = -Math.PI / 2 } = {}) {
  window.dispatchEvent(new CustomEvent('alab:burst', { detail: { x, y, count, power, spread, angle } }));
}

/** Burst from the center of an element. */
export function burstFrom(el, opts) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, opts);
}

/** Whole-screen flame wave (easter egg). */
export function inferno() {
  window.dispatchEvent(new CustomEvent('alab:inferno'));
}

export function toast(message) {
  window.dispatchEvent(new CustomEvent('alab:toast', { detail: { message } }));
}

/** One-shot sound effect; only plays if the campfire sound is switched on. */
export function sfx(type) {
  window.dispatchEvent(new CustomEvent('alab:sfx', { detail: { type } }));
}
