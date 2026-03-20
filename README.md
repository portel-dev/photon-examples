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
| **walkthrough** | 13-slide interactive tutorial — build your first photon from zero |
| **render-showcase** | All 48 output formats (table, gauge, chart, map, calendar, etc.) |
| **input-showcase** | All 22 input widgets (date picker, tags, rating, code editor, etc.) |

## Usage

```bash
photon beam        # Open Beam, click any example in the sidebar
```

Or run directly:

```bash
photon cli walkthrough start       # View the walkthrough slides
photon cli input-showcase rate     # Try the star rating widget
```

## Contributing

Want to add a tutorial or showcase? Create a `.photon.ts` file in `local/` and submit a PR. Keep slides/markdown in separate asset files for agent-friendliness.
