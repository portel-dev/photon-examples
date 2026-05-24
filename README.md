# Photon Examples

Focused examples for the [Photon runtime](https://github.com/portel-dev/photon).
Use this repo when you want to learn a capability in isolation: rendering,
inputs, background work, discovery metadata, runtime context, or streaming
progress.

For ready-to-use tools and apps, use the
[Photon Apps marketplace](https://github.com/portel-dev/photons).

<!-- PHOTON_MARKETPLACE_START -->
# Photon Examples

A focused set of teaching photons that show one Photon capability at a time.

These are learning-oriented photons. For production-ready tools, use the main Photon app marketplace.

## Gallery

### Start Here

Small walkthroughs for learning Photon mechanics without a large app in the way.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Walkthrough**](walkthrough.md) | A guided first photon that explains the file, methods, and outputs. | 8 | Workflow |
| [**Discoverable**](discoverable.md) | Shows how metadata and method descriptions make a photon easy for agents to use. | 3 | API |
| [**Context Aware**](context-aware.md) | Demonstrates runtime context and environment-aware behavior. | 2 | API |

### User Interfaces

Examples that show how a method result turns into a useful embedded app surface.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Render Showcase**](render-showcase.md) | Returns rich UI output so chat clients and Beam can render more than text. | 13 | API + UI |
| [**Input Showcase**](input-showcase.md) | Demonstrates form inputs and interactive parameters for agent-driven workflows. | 22 | API |
| [**AG-UI Showcase**](ag-ui-showcase.md) | Shows agent UI events and structured interaction patterns. | 3 | Streaming |
| [**Pizzaz Shop**](pizzaz-shop.md) | A playful storefront example for embedded app flows and state transitions. | 5 | Streaming |

### Runtime Patterns

Examples for background work, streaming progress, and observable state.

| Photon | What it gives an agent | Tools | Shape |
|--------|------------------------|-------|-------|
| [**Background Job**](background-job.md) | Demonstrates long-running work and progress updates. | 2 | Streaming |
| [**Deploy Pipeline**](deploy-pipeline.md) | Shows streaming deployment stages as an agent-friendly workflow. | 2 | Streaming |
| [**Observable**](observable.md) | Demonstrates observable state changes that clients can follow. | 2 | API |



## Quick Start

```bash
# Install the CLI
bun add -g @portel/photon

# Add a photon from this marketplace
photon add walkthrough

# Get MCP config (paste into your client)
photon info walkthrough --mcp
```

Output:
```json
{
  "mcpServers": {
    "walkthrough": {
      "command": "photon",
      "args": ["mcp", "walkthrough"]
    }
  }
}
```

## Commands

```bash
photon add <name>        # Install a photon
photon list              # List local photons
photon info <name> --mcp # Get MCP config for a photon
photon search <keyword>  # Search available photons
photon upgrade           # Upgrade all photons
```

---

[Photon CLI](https://github.com/portel-dev/photon) · [MCP](https://modelcontextprotocol.io/introduction)

<!-- PHOTON_MARKETPLACE_END -->
