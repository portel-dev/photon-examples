# Ag Ui Showcase

AG-UI Event Showcase Demonstrates how photon yields map to AG-UI protocol events. String yields become TEXT_MESSAGE events, progress yields become STEP events, and return values become STATE_SNAPSHOT events.

> **3 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `stream` ⚡

Stream text content as AG-UI TEXT_MESSAGE events. Each string yield maps to TEXT_MESSAGE_CONTENT. The first yield triggers TEXT_MESSAGE_START.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Subject to stream about |





---


### `progress` ⚡

Demonstrate step progress as AG-UI STEP events. Progress yields with value < 1.0 trigger STEP_STARTED. Progress at 1.0 triggers STEP_FINISHED.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `steps` | number | Yes | Number of steps to execute |





---


### `snapshot`

Return a state snapshot as AG-UI STATE_SNAPSHOT event. The return value of any method is automatically wrapped as a STATE_SNAPSHOT when using the AG-UI adapter.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | State key name |
| `value` | string | Yes | State value to capture |





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph ag_ui_showcase["📦 Ag Ui Showcase"]
        direction TB
        PHOTON((🎯))
        T0[🌊 stream (stream)]
        PHOTON --> T0
        T1[🌊 progress (stream)]
        PHOTON --> T1
        T2[🔧 snapshot]
        PHOTON --> T2
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add ag-ui-showcase

# Get MCP config for your client
photon info ag-ui-showcase --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0
