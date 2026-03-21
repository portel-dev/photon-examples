# Photon Examples

Example photons for learning — walkthroughs, showcases, and tutorials.

## Install

```bash
photon marketplace add portel-dev/photon-examples
```

Then install any example:

```bash
photon add walkthrough
photon add render-showcase
photon add input-showcase
```

## Examples

| Photon | Description |
|--------|-------------|
| **walkthrough** | Interactive slide deck tutorial — build your first photon from zero |
| **render-showcase** | All 48 output formats (table, gauge, chart, map, calendar, etc.) |
| **input-showcase** | All 22 input widgets (date picker, tags, rating, code editor, etc.) |
| **pizzaz-shop** | AI pizza ordering assistant — real-world e-commerce photon |
| **shopping-cart** | AI shopping assistant with cart management |
| **ag-ui-showcase** | AG-UI protocol event showcase |
| **background-job** | Background job processor with progress tracking |
| **context-aware** | Context-aware photon with environment detection |
| **deploy-pipeline** | Deployment pipeline with stages and rollback |
| **discoverable** | Discoverable service with capability metadata |
| **observable** | Observable computation with real-time streaming |

### Templates

HTML templates for custom UI development:

| Template | Description |
|----------|-------------|
| `dashboard.template.html` | Multi-widget dashboard with data bindings |
| `keypad.template.html` | Numeric keypad with method calls |
| `player.template.html` | Media player controls |
| `remote.template.html` | TV remote control interface |

## Usage

```bash
photon beam        # Open Beam, click any example in the sidebar
```

Or run directly:

```bash
photon cli walkthrough main        # View the walkthrough slides
photon cli input-showcase rate     # Try the star rating widget
photon cli render-showcase table   # See table rendering
```

## Contributing

Want to add a tutorial or showcase? Create a `.photon.ts` file in `local/` and submit a PR. Keep slides/markdown in separate asset files for agent-friendliness.
