/**
 * Photon Walkthrough
 *
 * An interactive step-by-step guide to building photons.
 * Every demo is a real method on this photon — zero external dependencies.
 * The slides show code for named classes, but the live UI calls these methods.
 *
 * @version 2.0.0
 * @icon 📖
 */
export default class Walkthrough {
  /**
   * Learn to build photons — from zero to production
   * @format slides
   */
  main() {
    return this.assets('slides.md', true);
  }

  // ── Step 1: The Basics ─────────────────────────────────────

  /**
   * Say hello — the simplest possible photon method
   * @param name Who to greet
   */
  greet({ name }: { name: string }) {
    return `Hello, ${name}!`;
  }

  // ── Step 2: Parameters ─────────────────────────────────────

  /**
   * Add two numbers together
   * @param a First number
   * @param b Second number
   */
  add({ a, b }: { a: number; b: number }) {
    return { result: a + b, expression: `${a} + ${b} = ${a + b}` };
  }

  // ── Step 3: Output Formats ─────────────────────────────────

  /**
   * Team roster — rendered as a table
   * @format table
   * @readOnly
   */
  team() {
    return [
      { name: 'Alice', role: 'Engineer', status: 'Active' },
      { name: 'Bob', role: 'Designer', status: 'Active' },
      { name: 'Carol', role: 'PM', status: 'Away' },
      { name: 'Dave', role: 'Engineer', status: 'Active' },
    ];
  }

  /**
   * System health — rendered as a gauge
   * @format gauge
   * @readOnly
   */
  health() {
    return { value: 73, max: 100, label: 'CPU', unit: '%' };
  }

  /**
   * Quarterly revenue — rendered as a bar chart
   * @format chart:bar
   * @readOnly
   */
  revenue() {
    return [
      { label: 'Q1', value: 42000 },
      { label: 'Q2', value: 58000 },
      { label: 'Q3', value: 51000 },
      { label: 'Q4', value: 67000 },
    ];
  }

  // ── Step 4: Input Formats ──────────────────────────────────

  /**
   * User registration form with specialized input widgets
   * @param email Email address {@format email}
   * @param birthday Date of birth {@format date}
   * @param role User role {@format segmented}
   * @param bio Short bio {@format textarea}
   */
  register({ email, birthday, role, bio }: {
    email: string;
    birthday: string;
    role: 'admin' | 'editor' | 'viewer';
    bio: string;
  }) {
    return { registered: true, email, birthday, role, bio: bio.slice(0, 100) };
  }

  // ── Step 7: Real-time Updates ──────────────────────────────

  /**
   * Live CPU monitor — streams gauge updates every second
   * @format gauge
   * @readOnly
   */
  async *monitor() {
    for (let i = 0; i < 10; i++) {
      const value = Math.round(30 + Math.random() * 50);
      yield {
        emit: 'render',
        format: 'gauge',
        value: { value, max: 100, label: 'CPU', unit: '%' },
      };
      await new Promise(r => setTimeout(r, 1000));
    }
    return { value: 42, max: 100, label: 'CPU', unit: '%' };
  }
}
