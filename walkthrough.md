# Walkthrough

Photon Walkthrough An interactive step-by-step guide to building photons. Every demo is a real method on this photon — zero external dependencies. The slides show code for named classes, but the live UI calls these methods.

> **8 tools** · Workflow Photon · v2.0.0 · MIT

**Platform Features:** `generator` `streaming`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `main` | Learn to build photons — from zero to production |
| `greet` | Say hello — the simplest possible photon method |
| `add` | Add two numbers together |
| `team` | Team roster — rendered as a table |
| `health` | System health — rendered as a gauge |
| `revenue` | Quarterly revenue — rendered as a bar chart |
| `register` | User registration form with specialized input widgets |
| `monitor` ⚡ | Live CPU monitor — streams gauge updates every second |


## 🔧 Tools


### `main`

Learn to build photons — from zero to production





---


### `greet`

Say hello — the simplest possible photon method


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | any | Yes | Who to greet |





---


### `add`

Add two numbers together


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `a` | any | Yes | First number |
| `b` | number } | Yes | Second number |





---


### `team`

Team roster — rendered as a table





---


### `health`

System health — rendered as a gauge





---


### `revenue`

Quarterly revenue — rendered as a bar chart





---


### `register`

User registration form with specialized input widgets


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | any | Yes | Email address [format: email] |
| `birthday` | string | Yes | Date of birth [format: date] |
| `role` | 'admin' | 'editor' | 'viewer' | Yes | User role [format: segmented] |
| `bio` | string | Yes | Short bio [format: textarea] |





---


### `monitor` ⚡

Live CPU monitor — streams gauge updates every second





---





## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph walkthrough["📦 Walkthrough"]
        START([▶ Start])
        N0[📣 render]
        START --> N0
        SUCCESS([✅ Success])
        N0 --> SUCCESS
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add walkthrough

# Get MCP config for your client
photon info walkthrough --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v2.0.0
