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

<!-- PHOTON_MARKETPLACE_START -->
# photon-examples

> **Singular focus. Precise target.**

**Photons** are single-file TypeScript MCP servers that supercharge AI assistants with focused capabilities. Each photon delivers ONE thing exceptionally well - from filesystem operations to cloud integrations.

Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction), photons are:
- 📦 **One-command install** via [Photon CLI](https://github.com/portel-dev/photon)
- 🎯 **Laser-focused** on singular capabilities
- ⚡ **Zero-config** with auto-dependency management
- 🔌 **Universal** - works with Claude Desktop, Claude Code, and any MCP client

## 📦 Available Photons

| Photon | Focus | Tools | Features |
|--------|-------|-------|----------|
| [**Ag Ui Showcase**](ag-ui-showcase.md) | AG-UI Event Showcase Demonstrates how photon yields map to AG-UI protocol events. String yields become TEXT_MESSAGE events, progress yields become STEP events, and return values become STATE_SNAPSHOT events. | 3 | ⚡ |
| [**Autoloop**](autoloop.md) | AutoLoop — Self-Improving Optimization Loop Applies Karpathy's auto-research pattern to anything with a measurable output. Give it a file to optimize, binary eval criteria, and a way to measure results. It pulls real data, scores outputs, finds what works, rewrites the file, and logs every change. Each instance (`_use`) is a separate optimization target: `_use('video-hooks')` — optimize video script hooks `_use('email-subject')` — optimize email subject lines `_use('landing-cta')` — optimize landing page CTAs | 13 | - |
| [**Autorun**](autorun.md) | AutoRun — Orchestrates self-improvement loops for any photon A meta-photon that automates the Karpathy auto-research pattern. Point it at any photon that follows the AutoResearch interface, and it runs the full loop: pull → eval → analyze → improve → log. Target photons must implement these methods: `prompt()`              → returns current prompt/template content `update({ content })`   → writes the improved version `pull()`                → returns performance data points `criteria()`            → returns binary eval criteria The calling LLM acts as the eval engine — the `run` generator yields each output for scoring, then asks the LLM to analyze and improve. Usage: `_use('my-content')` — one instance per optimization target `autorun start --target content --interval daily` | 6 | ⚡💬⚡ |
| [**Background Job**](background-job.md) | Background Job Processor Demonstrates MCP Tasks for fire-and-forget async operations. Designed for tasks/create — the client gets a task ID immediately and polls tasks/get for progress and results. | 2 | ⚡ |
| [**Context Aware**](context-aware.md) | Context-Aware Photon Demonstrates bidirectional state exposure where frontend widget state flows into photon methods via this._clientState. | 2 | - |
| [**Deploy Pipeline**](deploy-pipeline.md) | Deploy Pipeline Demonstrates persistent approvals for destructive operations. Approval confirmations survive page navigation and server restarts. | 2 | ⚡ |
| [**Discoverable**](discoverable.md) | Discoverable Service Demonstrates Server Cards and A2A Agent Cards. Both card types are auto-generated from the same photon metadata — rich docblocks, @stateful tag, and method descriptions map directly to MCP Server Card tools and A2A Agent Card skills. | 3 | - |
| [**Docs**](docs.md) | Docs — Markdown Document Editor with PDF Export A document editor backed by plain markdown files with YAML frontmatter. Each instance is a document: `_use('quarterly-report')` → `quarterly-report.md`. Pass a full path to open any file: `_use('/path/to/doc.md')`. Features page-aware preview via Paged.js, TOC generation, footnotes, custom containers (note/warning/tip), multi-column layouts, and PDF export. | 11 | 🎨 |
| [**Email Subject**](email-subject.md) | Email Subject — AutoResearch target for email subject lines Implements the AutoResearch interface so autorun can optimize your email subject lines based on real open rates. Stores the template and pulls metrics from a CSV log. | 7 | - |
| [**Input Showcase**](input-showcase.md) | Input Showcase Demonstrates all input format types in the Photon auto-UI. Each method showcases a different input widget. | 22 | - |
| [**Landing Copy**](landing-copy.md) | Landing Copy — AutoResearch target for landing page copy Implements the AutoResearch interface so autorun can optimize your landing page hero copy based on conversion rates. Stores variants and tracks which ones convert. | 7 | - |
| [**Observable**](observable.md) | Observable Computation Service Demonstrates OpenTelemetry GenAI instrumentation. When @opentelemetry/api is installed, all tool calls produce gen_ai.tool.call spans with standardized attributes. Without the package, everything works with zero overhead. | 2 | - |
| [**Pizzaz Shop**](pizzaz-shop.md) | AI Pizza Ordering Assistant Demonstrates the AI+Human transaction workflow for food ordering: 1. AI suggests pizzas based on preferences 2. Human selects and customizes items 3. Human reviews cart and confirms order 4. System processes order with delivery info | 5 | ⚡ |
| [**Render Showcase**](render-showcase.md) | Render Showcase Demonstrates photon.render() — how custom UIs can use auto UI format renderers (table, gauge, chart, etc.) without building everything from scratch. Each method returns sample data in a shape that a specific format renderer understands. The custom UI dashboard calls photon.render(container, data, format) to visualize them. | 13 | 🎨🎨 |
| [**Shopping Cart**](shopping-cart.md) | AI Shopping Assistant Demonstrates the AI+Human transaction workflow for e-commerce: 1. AI suggests products based on query 2. Human reviews and selects items 3. Human confirms purchase 4. System processes order | 4 | ⚡ |
| [**Slides**](slides.md) | Slides — AI-Native Presentation Tool Each instance is a deck: `_use('quarterly-review')` → `quarterly-review.md`. Pass a full path to open any markdown file: `_use('/path/to/deck.md')`. | 14 | 🎨🎨 |
| [**Social Hooks**](social-hooks.md) | Social Hooks — AutoResearch target for video/social media hooks Implements the AutoResearch interface so autorun can optimize your video hooks based on real view counts. Stores the prompt template as a markdown file and pulls metrics from a CSV log. Feed your view counts into the CSV and let the loop optimize which hook patterns get the most views. | 7 | - |
| [**Spreadsheet**](spreadsheet.md) | Spreadsheet — CSV-backed spreadsheet with formulas A spreadsheet engine that works on plain CSV files. Formulas (=SUM, =AVG, etc.) are stored directly in CSV cells and evaluated at runtime. Named instances map to CSV files: `_use('budget')` → `budget.csv` in your spreadsheets folder. Pass a full path to open any CSV: `_use('/path/to/data.csv')`. | 37 | 🎨🎨 |
| [**Walkthrough**](walkthrough.md) | Photon Walkthrough An interactive step-by-step guide to building photons. Every demo is a real method on this photon — zero external dependencies. The slides show code for named classes, but the live UI calls these methods. | 8 | ⚡⚡ |
| [**Web Glow**](web-glow.md) | WebGlow — Automated Website Redesign Pipeline Finds local businesses with ugly websites, redesigns them into polished demos, deploys them for free, and queues outreach. Schedule it daily to generate a steady stream of leads. Pipeline: scan → qualify → redesign → deploy → outreach Each instance (`_use`) targets a niche + city: `_use('nail-salons-sydney')` `_use('wedding-venues-london')` `_use('restaurants-austin')` | 13 | ⚡💬⚡ |


**Total:** 20 photons ready to use

---

## 🚀 Quick Start

### 1. Install Photon

```bash
npm install -g @portel/photon
```

### 2. Add Any Photon

```bash
photon add filesystem
photon add git
photon add aws-s3
```

### 3. Use It

```bash
# Run as MCP server
photon mcp filesystem

# Get config for your MCP client
photon get filesystem --mcp
```

Output (paste directly into your MCP client config):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "photon",
      "args": ["mcp", "filesystem"]
    }
  }
}
```

Add the output to your MCP client's configuration. **Consult your client's documentation** for setup instructions.

**That's it!** Your AI assistant now has 20 focused tools at its fingertips.

---

## 🎨 Claude Code Integration

This marketplace is also available as a **Claude Code plugin**, enabling seamless installation of individual photons directly from Claude Code's plugin manager.

### Install as Claude Code Plugin

```bash
# In Claude Code, run:
/plugin marketplace add portel-dev/photons
```

Once added, you can install individual photons:

```bash
# Install specific photons you need
/plugin install filesystem@photons-marketplace
/plugin install git@photons-marketplace
/plugin install knowledge-graph@photons-marketplace
```

### Benefits of Claude Code Plugin

- **🎯 Granular Installation**: Install only the photons you need
- **🔄 Auto-Updates**: Plugin stays synced with marketplace
- **⚡ Zero Config**: Photon CLI auto-installs on first use
- **🛡️ Secure**: No credentials shared with AI (interactive setup available)
- **📦 Individual MCPs**: Each photon is a separate installable plugin

### How This Plugin Is Built

This marketplace doubles as a Claude Code plugin through automatic generation:

```bash
# Generate marketplace AND Claude Code plugin files
photon maker sync --claude-code
```

This single command:
1. Scans all `.photon.ts` files
2. Generates `.marketplace/photons.json` manifest
3. Creates `.claude-plugin/marketplace.json` for Claude Code
4. Generates documentation for each photon
5. Creates auto-install hooks for seamless setup

**Result**: One source of truth, two distribution channels (Photon CLI + Claude Code).

---

## ⚛️ What Are Photons?

**Photons** are laser-focused modules - each does ONE thing exceptionally well:
- 📁 **Filesystem** - File operations
- 🐙 **Git** - Repository management
- ☁️ **AWS S3** - Cloud storage
- 📅 **Google Calendar** - Calendar integration
- 🕐 **Time** - Timezone operations
- ... and more

Each photon delivers **singular focus** to a **precise target**.

**Key Features:**
- 🎯 Each photon does one thing perfectly
- 📦 20 production-ready photons available
- ⚡ Auto-installs dependencies
- 🔧 Works out of the box
- 📄 Single-file design (easy to fork and customize)

## 🎯 The Value Proposition

### Before Photon

For each MCP server:
1. Find and clone the repository
2. Install dependencies manually
3. Configure environment variables
4. Write MCP client config JSON by hand
5. Repeat for every server

### With Photon

```bash
# Install from marketplace
photon add filesystem

# Get MCP config
photon get filesystem --mcp
```

Output (paste directly into your MCP client config):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "photon",
      "args": ["mcp", "filesystem"]
    }
  }
}
```

**That's it.** No dependencies, no environment setup, no configuration files.

**Difference:**
- ✅ One CLI, one command
- ✅ Zero configuration
- ✅ Instant installation
- ✅ Auto-dependencies
- ✅ Consistent experience

## 💡 Use Cases

**For Claude Users:**
```bash
photon add filesystem git github-issues
photon get --mcp  # Get config for all three
```
Add to Claude Desktop → Now Claude can read files, manage repos, create issues

**For Teams:**
```bash
photon add postgres mongodb redis
photon get --mcp
```
Give Claude access to your data infrastructure

**For Developers:**
```bash
photon add docker git slack
photon get --mcp
```
Automate your workflow through AI

## 🔍 Browse & Search

```bash
# List all photons
photon get

# Search by keyword
photon search calendar

# View details
photon get google-calendar

# Upgrade all
photon upgrade
```

## 🏢 For Enterprises

Create your own marketplace:

```bash
# 1. Organize photons
mkdir company-photons && cd company-photons

# 2. Generate marketplace
photon maker sync

# 3. Share with team
git push origin main

# Team members use:
photon marketplace add company/photons
photon add your-internal-tool
```

---

**Built with singular focus. Deployed with precise targeting.**

Made with ⚛️ by [Portel](https://github.com/portel-dev)

<!-- PHOTON_MARKETPLACE_END -->
