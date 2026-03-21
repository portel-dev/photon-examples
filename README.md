# Photon Examples

Example photons for the [Photon runtime](https://github.com/portel-dev/photon) — every file is a complete, working MCP server.

## Quick Start

```bash
npm install -g @portel/photon     # Install the runtime
photon beam                       # Open the web UI
```

Then install any example:

```bash
photon add walkthrough            # Interactive tutorial
photon add render-showcase        # All 48 output formats
photon add input-showcase         # All 22 input widgets
```

## What's a Photon?

A single `.photon.ts` file that becomes a full MCP server. Every public method becomes a tool:

```typescript
// hello.photon.ts
export default class Hello {
  greet({ name }: { name: string }) {
    return `Hello, ${name}!`;
  }
}
```

That's it. Run with `photon beam`, `photon cli hello greet --name World`, or connect from Claude/Cursor.

## Examples

### Learning

| Photon | What You'll Learn |
|--------|-------------------|
| [**walkthrough**](local/walkthrough.photon.ts) | 15-slide interactive tutorial — parameters, formats, state, streaming, custom UI, deployment |
| [**render-showcase**](local/render-showcase.photon.ts) | All 48 `@format` types — table, gauge, chart, metric, timeline, calendar, map, and more |
| [**input-showcase**](local/input-showcase.photon.ts) | All 22 input widgets — date picker, tags, rating, segmented, code editor, markdown |

### Real-World Patterns

| Photon | Pattern |
|--------|---------|
| [**pizzaz-shop**](local/pizzaz-shop.photon.ts) | E-commerce with menu, cart, orders — `@stateful` + structured output |
| [**shopping-cart**](local/shopping-cart.photon.ts) | Cart management — add, remove, checkout flow |
| [**deploy-pipeline**](local/deploy-pipeline.photon.ts) | Multi-stage deployment with rollback — async operations |
| [**background-job**](local/background-job.photon.ts) | Job queue with progress tracking — `async *` generators |

### Advanced Features

| Photon | Feature |
|--------|---------|
| [**ag-ui-showcase**](local/ag-ui-showcase.photon.ts) | AG-UI protocol events — streaming, progress, state snapshots |
| [**context-aware**](local/context-aware.photon.ts) | Environment detection and adaptive behavior |
| [**discoverable**](local/discoverable.photon.ts) | Service capability metadata for agent discovery |
| [**observable**](local/observable.photon.ts) | Real-time computation streaming with `yield` |

### Custom UI Templates

HTML templates using declarative `data-method` bindings — zero JavaScript:

| Template | UI Pattern |
|----------|------------|
| [dashboard.template.html](local/templates/dashboard.template.html) | Multi-widget dashboard with live data bindings |
| [remote.template.html](local/templates/remote.template.html) | TV remote control with button grid |
| [keypad.template.html](local/templates/keypad.template.html) | Numeric keypad with display |
| [player.template.html](local/templates/player.template.html) | Media player controls |

## Usage

### Web UI (Beam)

```bash
photon beam                          # All photons in sidebar
photon beam walkthrough              # Focus on one photon
```

### CLI

```bash
photon cli walkthrough main          # View walkthrough slides
photon cli render-showcase table     # See table rendering
photon cli input-showcase rate       # Try star rating widget
photon cli pizzaz-shop menu          # Browse the pizza menu
```

### MCP (Claude, Cursor, etc.)

```bash
photon mcp render-showcase --config  # Generate MCP config JSON
```

## Contributing

Create a `.photon.ts` file in `local/` and submit a PR. Guidelines:

- **One file per photon** — self-contained, no external dependencies if possible
- **Single-word method names** — `start`, `add`, `list`, not `startGame`, `addItem`
- **Use `@format`** — show off the rendering system
- **Include JSDoc** — descriptions become tool descriptions for LLMs
- **Keep assets separate** — slides, images, HTML in a subfolder named after the photon
