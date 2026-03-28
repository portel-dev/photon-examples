/**
 * Photon Evidence
 *
 * Features and benefits of Photon — each method demonstrates
 * a platform intent backed by real, working code.
 *
 * @version 1.0.0
 * @icon ⚡
 */
export default class Evidence {
  /**
   * Photon: Features & Evidence
   * @format slides
   */
  main() {
    return this.assets('slides.md', true);
  }

  // ── Intent 1: Single File, Full Stack ──────────────────────

  /**
   * One method. Three interfaces. Zero config.
   * @param city City to check weather for
   * @format kv
   * @readOnly
   */
  forecast({ city }: { city: string }) {
    const temps: Record<string, number> = {
      london: 14, tokyo: 22, sydney: 19, berlin: 11, nyc: 16,
    };
    const t = temps[city.toLowerCase()] ?? 20;
    return {
      city,
      temperature: `${t}°C`,
      condition: t > 18 ? '☀️ Sunny' : '☁️ Cloudy',
      humidity: `${55 + Math.round(Math.random() * 20)}%`,
      wind: `${5 + Math.round(Math.random() * 15)} km/h`,
    };
  }

  // ── Intent 2: Human + Agent, Same Surface ──────────────────

  /**
   * Safe to auto-approve — no side effects
   * @format table
   * @readOnly
   */
  inventory() {
    return [
      { item: 'Widget A', stock: 142, status: '✅ In Stock' },
      { item: 'Widget B', stock: 7, status: '⚠️ Low' },
      { item: 'Widget C', stock: 0, status: '❌ Out' },
    ];
  }

  /**
   * Dangerous — requires explicit confirmation
   * @param item Item to remove from catalog
   * @destructive
   */
  discontinue({ item }: { item: string }) {
    return { removed: item, confirmation: `${item} has been discontinued` };
  }

  // ── Intent 4: Format-Driven Rendering ──────────────────────

  /**
   * Same data, rendered as a table
   * @format table
   * @readOnly
   */
  sales() {
    return [
      { region: 'North', q1: 42, q2: 58, q3: 51, q4: 67 },
      { region: 'South', q1: 38, q2: 45, q3: 62, q4: 54 },
      { region: 'East', q1: 55, q2: 49, q3: 47, q4: 71 },
      { region: 'West', q1: 31, q2: 63, q3: 58, q4: 48 },
    ];
  }

  /**
   * Same data, rendered as a bar chart
   * @format chart:bar
   * @readOnly
   */
  chart() {
    return [
      { label: 'North', value: 218 },
      { label: 'South', value: 199 },
      { label: 'East', value: 222 },
      { label: 'West', value: 200 },
    ];
  }

  /**
   * System vitals as gauges
   * @format gauge
   * @readOnly
   */
  vitals() {
    return { value: 73, max: 100, label: 'CPU', unit: '%' };
  }

  /**
   * Deployment pipeline
   * @format steps
   * @readOnly
   */
  pipeline() {
    return [
      { label: 'Build', status: 'complete', detail: '12s' },
      { label: 'Test', status: 'complete', detail: '45s' },
      { label: 'Stage', status: 'active', detail: 'Running...' },
      { label: 'Deploy', status: 'pending', detail: 'Waiting' },
    ];
  }

  // ── Intent 5: Stateful by Annotation ───────────────────────

  private notes: string[] = ['Ship v2', 'Review PR #42', 'Update docs'];

  /**
   * View all notes — state persists across restarts
   * @format list
   * @readOnly
   */
  list() {
    return this.notes.map(n => ({ name: n, status: 'pending' }));
  }

  // ── Intent 7: Real-time Updates ────────────────────────────

  /**
   * Live deployment progress — streams updates every second
   * @format progress
   * @readOnly
   */
  async *deploy() {
    const stages = ['Building...', 'Testing...', 'Staging...', 'Deploying...', 'Done!'];
    for (let i = 0; i < stages.length; i++) {
      yield {
        emit: 'render',
        format: 'progress',
        value: {
          value: Math.round((i / (stages.length - 1)) * 100),
          label: stages[i],
        },
      };
      await new Promise(r => setTimeout(r, 1200));
    }
    return { value: 100, label: '✅ Deployed successfully' };
  }

  // ── Intent 8: Resilient by Default ─────────────────────────

  /**
   * Fetch external data with automatic retry and timeout
   * @retryable 3
   * @timeout 5000
   * @cached 60
   * @format kv
   * @readOnly
   */
  status() {
    return {
      api: '✅ Healthy',
      database: '✅ Connected',
      cache: '✅ Warm',
      uptime: '14d 6h 32m',
      lastCheck: new Date().toISOString(),
    };
  }
}
