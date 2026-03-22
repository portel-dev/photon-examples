# Background Job

Background Job Processor Demonstrates MCP Tasks for fire-and-forget async operations. Designed for tasks/create — the client gets a task ID immediately and polls tasks/get for progress and results.

> **2 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `process` ⚡

Process a batch of items with progress tracking. When invoked via tasks/create, the runtime wraps this method: 1. Client receives { taskId } immediately 2. Progress yields update the task's progress field 3. Return value is stored as the task's result 4. Errors set the task state to 'failed'


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | string[] | Yes | List of items to process |





---


### `status`

Quick status check (non-background)





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph background_job["📦 Background Job"]
        direction TB
        PHOTON((🎯))
        T0[🌊 process (stream)]
        PHOTON --> T0
        T1[🔧 status]
        PHOTON --> T1
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add background-job

# Get MCP config for your client
photon info background-job --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0
