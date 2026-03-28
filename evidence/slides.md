---
marp: true
theme: default
transition: fade
paginate: true
header: "⚡ Photon"
footer: "portel.dev/photon"
---

# Define Intent Once. Deliver Everywhere.

### One TypeScript file becomes a CLI, MCP server, and web app.

No framework. No boilerplate. No config.
Just annotated TypeScript — and the platform does the rest.

---

<!-- transition: slide -->

# Intent 1 — Single File, Full Stack

*Write one file. Get three interfaces.*

<div class="cols">
  <div>

```typescript
// weather.photon.ts
export default class Weather {
  /**
   * @param city City to check
   * @format kv
   * @readOnly
   */
  forecast({ city }: { city: string }) {
    return {
      city,
      temperature: '22°C',
      condition: '☀️ Sunny',
      humidity: '62%',
    };
  }
}
```

**Tags:** `@format` · `@readOnly` · `@param`
No imports. No setup. One file.

  </div>
  <div>
    <p class="small muted">Same method → CLI, MCP, and Beam:</p>
    <div data-embed="evidence/forecast" data-embed-params='{"city":"Tokyo"}' data-embed-height="200"></div>

```bash
# CLI
photon cli weather forecast --city Tokyo

# MCP — works in Claude, Cursor, any client
photon mcp weather

# Web UI
photon beam
```

  </div>
</div>

---

# Intent 2 — Human + Agent, Same Surface

*One method serves humans and AI agents. Annotations guide both.*

<div class="cols">
  <div>

```typescript
export default class Catalog {
  /**
   * @format table
   * @readOnly    ← safe, auto-approve
   */
  inventory() {
    return [
      { item: 'Widget A', stock: 142 },
      { item: 'Widget B', stock: 7 },
    ];
  }

  /**
   * @destructive ← requires confirmation
   */
  discontinue({ item }: { item: string }) {
    return { removed: item };
  }
}
```

**Tags:** `@readOnly` · `@destructive` · `@idempotent`
Same annotations inform UI and agent behavior.

  </div>
  <div>
    <p class="small muted">@readOnly — no confirmation needed:</p>
    <div data-embed="evidence/inventory" data-embed-height="160"></div>

| Annotation | Human (Beam) | Agent (MCP) |
|-----------|-------------|------------|
| `@readOnly` | No confirm | Auto-approve |
| `@destructive` | ⚠️ Dialog | Flag in schema |
| `@idempotent` | Retry button | Safe to retry |

  </div>
</div>

---

<!-- transition: cover -->

# Intent 3 — Zero Config

*Install → run. No setup wizard, no config files.*

<div class="cols">
  <div>

```typescript
/**
 * @dependencies axios@^1.0.0
 * @cli ffmpeg
 * @photon todo
 */
export default class App {
  // axios installed on first run
  // ffmpeg checked at load time
  // todo photon auto-resolved

  protected settings = {
    maxRetries: 3,
    apiKey: '',  // → masked input
  };
}
```

**Tags:** `@dependencies` · `@cli` · `@photon`
Dependencies resolve themselves.
Settings auto-generate a UI panel.

  </div>
  <div>

### What happens at runtime:

| Tag | Effect |
|-----|--------|
| `@dependencies axios` | npm-installs on first load |
| `@cli ffmpeg` | Blocks with clear error if missing |
| `@photon todo` | Fetches from marketplace |
| `protected settings` | Auto-generates settings tool |

### What you don't write:

- ~~package.json~~ — auto-managed
- ~~tsconfig.json~~ — not needed
- ~~.env files~~ — constructor params + env vars
- ~~setup scripts~~ — just run it

  </div>
</div>

---

<!-- transition: slide -->

# Intent 4 — Format-Driven Rendering

*Annotate once. Every surface renders it right.*

<div class="cols">
  <div>

```typescript
export default class Dashboard {
  /** @format table */
  sales() {
    return [
      { region: 'North', q1: 42, q2: 58 },
      { region: 'South', q1: 38, q2: 45 },
    ];
  }

  /** @format chart:bar */
  chart() {
    return [
      { label: 'North', value: 218 },
      { label: 'South', value: 199 },
    ];
  }

  /** @format gauge */
  vitals() {
    return { value: 73, max: 100,
             label: 'CPU', unit: '%' };
  }
}
```

**Tag:** `@format` — one word, renders everywhere.

  </div>
  <div>
    <p class="small muted">Table:</p>
    <div data-embed="evidence/sales" data-embed-height="140"></div>
    <p class="small muted mt-1">Chart:</p>
    <div data-embed="evidence/chart" data-embed-height="180"></div>
    <p class="small muted mt-1">Gauge:</p>
    <div data-embed="evidence/vitals" data-embed-height="100"></div>
  </div>
</div>

---

# 48 Formats. One Tag.

| Category | Formats |
|----------|---------|
| **Data** | table, list, card, kv, tree, grid |
| **Charts** | chart:bar, chart:line, chart:pie, chart:area, chart:donut |
| **Metrics** | metric, gauge, progress, badge, stat-group |
| **Content** | markdown, code, json, mermaid, diff, log |
| **Visuals** | timeline, calendar, map, heatmap, network, qr |
| **Layout** | steps, kanban, comparison, invoice, feature-grid |
| **Media** | image, embed, slides |

CLI gets ASCII tables. Beam gets interactive charts. MCP gets structured JSON.
**Same data, three renderings — zero extra code.**

---

<!-- transition: cover -->

# Intent 5 — Stateful by Annotation

*Add `@stateful`. Get persistence, events, and sync.*

<div class="cols">
  <div>

```typescript
/**
 * @stateful        ← this is it
 */
export default class Notes {
  private items: string[] = [];

  add({ text }: { text: string }) {
    this.items.push(text);
    return { added: text };
  }

  /** @format list */
  list() {
    return this.items.map(n => ({
      name: n, status: 'pending'
    }));
  }
}
```

**Tag:** `@stateful` — one word.
Persistence, events, audit trail. No database.

  </div>
  <div>
    <p class="small muted">State persists across restarts:</p>
    <div data-embed="evidence/list" data-embed-height="150"></div>

### What `@stateful` gives you:

| Feature | How |
|---------|-----|
| **Persistence** | JSON to `~/.photon/state/` |
| **Auto-events** | Every method emits execution event |
| **Named instances** | `--_use work` for separate state |
| **Audit trail** | `__meta` on returned objects |
| **Cross-tab sync** | All clients see same state |
| **Settings** | `protected settings = {...}` |

  </div>
</div>

---

<!-- transition: slide -->

# Intent 6 — Composable

*Photons call photons. Small tools compose into complex workflows.*

<div class="cols">
  <div>

```typescript
/**
 * @photon weather
 * @photon calendar
 * @photon notifications
 */
export default class Assistant {
  private weather: any;
  private calendar: any;
  private notifications: any;

  async plan({ date }: { date: string }) {
    const [forecast, events] =
      await Promise.all([
        this.weather.forecast({ city }),
        this.calendar.events({ date }),
      ]);

    if (forecast.rain)
      this.notifications.send({
        msg: 'Bring an umbrella' });

    return { date, forecast, events };
  }
}
```

**Tag:** `@photon` — inject, compose, orchestrate.

  </div>
  <div>

### How composition works:

```
Assistant
  ├── @photon weather     (marketplace)
  ├── @photon calendar    (local)
  └── @photon notifications
        └── @photon slack  (transitive)
```

- Auto-resolved from marketplace or local
- Events flow between composed photons
- `.on('weather:alert')` cross-photon events
- Transitive deps resolve automatically

### The philosophy:

> Don't build a monolith.
> Build small photons and compose them.
> The ecosystem is the feature set.

  </div>
</div>

---

<!-- transition: cover -->

# Intent 7 — Portable

*Build once. Deploy anywhere.*

<div class="cols">
  <div>

```bash
# Standalone binary — no runtime needed
photon build weather

# Works everywhere
./weather forecast --city London

# Deploy to any MCP client
photon mcp weather --config
```

**Tag:** `photon build` — one command.

  </div>
  <div>

| Target | How |
|--------|-----|
| **Beam** (Web UI) | `photon beam` |
| **Claude Desktop** | `photon mcp app --config` |
| **Cursor / Windsurf** | Same MCP config |
| **CLI** | `photon cli app method` |
| **Binary** | `photon build app` |
| **Docker** | Standard Dockerfile |
| **Cloudflare** | `photon deploy app` |

### One file → every platform.

No rewrites. No adapters.
The same `.photon.ts` runs unchanged.

  </div>
</div>

---

<!-- transition: slide -->

# Intent 8 — Resilient by Default

*Retry, timeout, cache, rate-limit — all from annotations.*

<div class="cols">
  <div>

```typescript
export default class API {
  /**
   * @retryable 3      ← retry on failure
   * @timeout 5000     ← kill after 5s
   * @cached 60        ← memoize 60s
   * @throttled 10/min ← rate limit
   */
  async fetch({ url }: { url: string }) {
    const res = await fetch(url);
    return res.json();
  }

  /**
   * @scheduled 0 * * * * ← runs hourly
   */
  async cleanup() { /* ... */ }

  /**
   * @circuitBreaker 5 30s
   */
  async external() { /* ... */ }
}
```

  </div>
  <div>
    <p class="small muted">Production-ready status:</p>
    <div data-embed="evidence/status" data-embed-height="200"></div>

### Middleware from annotations:

| Tag | Effect |
|-----|--------|
| `@retryable 3` | Retry up to 3 times |
| `@timeout 5000` | Kill after 5 seconds |
| `@cached 60` | Memoize for 60 seconds |
| `@throttled 10/min` | Rate limit calls |
| `@circuitBreaker` | Fast-reject on failure |
| `@scheduled` | Cron without infra |

**Zero try/catch. Zero boilerplate.**

  </div>
</div>

---

<!-- transition: cover -->

# Intent 9 — Secure by Default

*Auth, encryption, and access control — built-in primitives.*

<div class="cols">
  <div>

```typescript
export default class Admin {
  /**
   * @auth required
   */
  async dashboard() {
    const user = this.caller;
    // { id, name, email, claims }
    return this.getStats(user.id);
  }

  /**
   * @auth required
   * @locked
   */
  async migrate() {
    // Only one caller at a time
    // Lock assigned to caller.id
    await this.runMigration();
  }
}
```

**Tags:** `@auth` · `@locked` · `@webhook`

  </div>
  <div>

### Built-in security primitives:

| Tag | Effect |
|-----|--------|
| `@auth required` | Enforce authentication |
| `@locked` | Serialize access per caller |
| `@webhook` | HTTP endpoint with secret validation |

### What you don't build:

- ~~OAuth flow~~ — built in, auto-refresh
- ~~Token storage~~ — AES-256 vault, per-tenant
- ~~Session management~~ — `this.caller` always available
- ~~Rate limiting~~ — `@throttled` annotation
- ~~CORS config~~ — handled by runtime

  </div>
</div>

---

<!-- transition: slide -->

# Real-Time Streaming

*Generator methods push live updates to every connected client.*

<div class="cols">
  <div>

```typescript
export default class Deployer {
  /** @format progress */
  async *deploy() {
    yield { emit: 'render',
            format: 'progress',
            value: { value: 25,
                     label: 'Building...' }};
    await this.build();

    yield { emit: 'render',
            format: 'progress',
            value: { value: 75,
                     label: 'Deploying...' }};
    await this.push();

    return { value: 100,
             label: '✅ Live!' };
  }
}
```

**Pattern:** `yield` for live updates, `return` for final.

  </div>
  <div>
    <p class="small muted">Live — watch it stream:</p>
    <div data-embed="evidence/deploy" data-embed-height="160"></div>

### How streaming works:

- `yield { emit: 'render' }` → replaces display
- `this.render(format, value)` → same outside generators
- Works across **CLI**, **Beam**, and **MCP**
- SSE transport — no WebSocket

### What you don't build:

- ~~WebSocket server~~ — SSE built in
- ~~State management~~ — yield is the API
- ~~Client polling~~ — push, not pull

  </div>
</div>

---

<!-- transition: zoom -->

# The Evidence

### 9 intents. 23 promises. 85 testable assertions.

| # | Intent | Key Tags | Status |
|---|--------|----------|--------|
| 1 | Single File, Full Stack | `@format` `@param` | ✅ Proven |
| 2 | Human + Agent, Same Surface | `@readOnly` `@destructive` | ✅ Proven |
| 3 | Zero Config | `@dependencies` `@cli` `@photon` | ✅ Proven |
| 4 | Format-Driven Rendering | `@format` (48 formats) | ✅ Proven |
| 5 | Stateful by Annotation | `@stateful` | ✅ Proven |
| 6 | Composable | `@photon` | ✅ Proven |
| 7 | Portable | `photon build` | ✅ Proven |
| 8 | Resilient by Default | `@retryable` `@timeout` `@cached` | ✅ Proven |
| 9 | Secure by Default | `@auth` `@locked` | ✅ Proven |

**Every promise is a testable assertion. If it can't be validated, it's marketing.**

`npm run test:promises` — 18/21 passing, 3 skipped.

---

# TypeScript Is the Configuration Surface

```
┌─────────────────────────────────────────────────┐
│  class MyApp {                                  │
│    /** @format table  ← rendering              │
│     *  @readOnly      ← safety                 │
│     *  @cached 60     ← resilience             │
│     *  @param q Query ← schema                 │
│     */                                          │
│    search({ q }: { q: string }) {               │
│      return this.db.find(q);                    │
│    }                                            │
│  }                                              │
│                                                 │
│  One method. One docblock. Full stack.          │
└─────────────────────────────────────────────────┘
```

> **Define intent once. Deliver everywhere.**

---

# Get Started

```bash
npm i -g @portel/photon    # install
photon maker new my-app    # scaffold
photon beam                # open web UI
```

### Resources:
- **All 48 formats**: `photon cli render-showcase`
- **Docs**: `docs/reference/DOCBLOCK-TAGS.md`
- **Marketplace**: `photon search <keyword>`
- **Walkthrough**: `photon cli walkthrough main`

### The philosophy:
> Every method is a tool. Every file is a server.
> No boilerplate. No configuration. Just TypeScript.
