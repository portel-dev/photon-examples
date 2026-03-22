# Deploy Pipeline

Deploy Pipeline Demonstrates persistent approvals for destructive operations. Approval confirmations survive page navigation and server restarts.

> **2 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `deploy` ⚡

Deploy a service to production with persistent approval gate. The confirmation is persistent — it survives page navigation and server restarts. Marked as destructive for danger styling.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service` | string | Yes | Service name to deploy |
| `version` | string | Yes | Version string (e.g., "2.1.0") |





---


### `history`

View deployment history





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph deploy_pipeline["📦 Deploy Pipeline"]
        direction TB
        PHOTON((🎯))
        T0[🌊 deploy (stream)]
        PHOTON --> T0
        T1[🔧 history]
        PHOTON --> T1
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add deploy-pipeline

# Get MCP config for your client
photon info deploy-pipeline --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0
