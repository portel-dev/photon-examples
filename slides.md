# Slides

Slides — AI-Native Presentation Tool Each instance is a deck: `_use('quarterly-review')` → `quarterly-review.md`. Pass a full path to open any markdown file: `_use('/path/to/deck.md')`.

> **14 tools** · API Photon · v1.0.0 · MIT

**Platform Features:** `custom-ui` `stateful` `dashboard`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `main` | Open the presentation UI |
| `next` | Move to the next slide |
| `previous` | Move to the previous slide |
| `go` | Jump to a specific slide |
| `list` | List saved decks in the slides folder |
| `read` | Read the current deck's markdown |
| `save` | Save markdown to the current deck |
| `update` | Update the full markdown and re-render |
| `add` | Insert a new slide at a position |
| `edit` | Replace a slide's content |
| `move` | Reorder a slide |
| `remove` | Delete a slide |
| `duplicate` | Duplicate a slide |
| `status` | Current presentation state for AI context |


## 🔧 Tools


### `main`

Open the presentation UI





---


### `next`

Move to the next slide





---


### `previous`

Move to the previous slide





---


### `go`

Jump to a specific slide


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `index` | any | Yes | 0-based slide index |





---


### `list`

List saved decks in the slides folder





---


### `read`

Read the current deck's markdown





---


### `save`

Save markdown to the current deck


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | any | Yes | Full Marp markdown content |





---


### `update`

Update the full markdown and re-render


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | any | Yes | New Marp markdown content |





---


### `add`

Insert a new slide at a position


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | any | Yes | Slide content |
| `index` | number } | No | Position to insert (appends if omitted) |





---


### `edit`

Replace a slide's content


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `index` | any | Yes | Slide index |
| `markdown` | string } | Yes | New content |





---


### `move`

Reorder a slide


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | any | Yes | Source index |
| `to` | number } | Yes | Target index |





---


### `remove`

Delete a slide


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `index` | any | Yes | Slide index |





---


### `duplicate`

Duplicate a slide


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `index` | any | Yes | Slide index to copy |





---


### `status`

Current presentation state for AI context





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph slides["📦 Slides"]
        direction TB
        PHOTON((🎯))
        T0[🔧 main]
        PHOTON --> T0
        T1[🔧 next]
        PHOTON --> T1
        T2[🔧 previous]
        PHOTON --> T2
        T3[🔧 go]
        PHOTON --> T3
        T4[📖 list]
        PHOTON --> T4
        T5[📖 read]
        PHOTON --> T5
        T6[✏️ save]
        PHOTON --> T6
        T7[🔄 update]
        PHOTON --> T7
        T8[✏️ add]
        PHOTON --> T8
        T9[🔄 edit]
        PHOTON --> T9
        T10[🔧 move]
        PHOTON --> T10
        T11[🗑️ remove]
        PHOTON --> T11
        T12[🔧 duplicate]
        PHOTON --> T12
        T13[🔧 status]
        PHOTON --> T13
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add slides

# Get MCP config for your client
photon info slides --mcp
```

## 📦 Dependencies


```
@marp-team/marp-core@^4.3.0
```

---

MIT · v1.0.0
