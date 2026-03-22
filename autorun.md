# Autorun

AutoRun — Orchestrates self-improvement loops for any photon A meta-photon that automates the Karpathy auto-research pattern. Point it at any photon that follows the AutoResearch interface, and it runs the full loop: pull → eval → analyze → improve → log. Target photons must implement these methods: `prompt()`              → returns current prompt/template content `update({ content })`   → writes the improved version `pull()`                → returns performance data points `criteria()`            → returns binary eval criteria The calling LLM acts as the eval engine — the `run` generator yields each output for scoring, then asks the LLM to analyze and improve. Usage: `_use('my-content')` — one instance per optimization target `autorun start --target content --interval daily`

> **6 tools** · Workflow Photon · v1.0.0 · MIT

**Platform Features:** `generator` `elicitation` `streaming` `stateful`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `run` ⚡ | Run one full optimization cycle. |
| `start` | Schedule recurring optimization runs. |
| `stop` | Stop the scheduled optimization loop |
| `log` | View the research log from the underlying autoloop |
| `handoff` | Export full research log for model handoff |
| `status` | Current state of the runner |


## 🔧 Tools


### `run` ⚡

Run one full optimization cycle. Orchestrates the complete loop as an interactive generator. The calling LLM evaluates outputs and proposes improvements. Pass target (photon name), instance (optional _use name), and autoApply (skip human approval).





---


### `start`

Schedule recurring optimization runs. Pass target (photon name), interval (cron or





---


### `stop`

Stop the scheduled optimization loop





---


### `log`

View the research log from the underlying autoloop





---


### `handoff`

Export full research log for model handoff





---


### `status`

Current state of the runner





---





## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph autorun["📦 Autorun"]
        START([▶ Start])
        N0[📢 Connecting to ${target}${in...]
        START --> N0
        N1[📢 Got current prompt (${curre...]
        N0 --> N1
        N2[📢 Loaded ${criteria.length} e...]
        N1 --> N2
        N3[📢 Pulled ${dataPoints.length}...]
        N2 --> N3
        N4[📣 render]
        N3 --> N4
        N5[📢 Scored ${evalResponse.lengt...]
        N4 --> N5
        N6[📢 Scored ${scores.length} out...]
        N5 --> N6
        N7[📣 render]
        N6 --> N7
        N8[📢 Improvement applied automat...]
        N7 --> N8
        N9{🙋 Apply this improvement...}
        N8 --> N9
        N10([❌ Cancelled])
        N9 -->|No| N10
        N9 -->|Yes| N11
        N11[Continue]
        SUCCESS([✅ Success])
        N11 --> SUCCESS
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add autorun

# Get MCP config for your client
photon info autorun --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0
