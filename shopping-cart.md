# Shopping Cart

AI Shopping Assistant Demonstrates the AI+Human transaction workflow for e-commerce: 1. AI suggests products based on query 2. Human reviews and selects items 3. Human confirms purchase 4. System processes order

> **4 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `search` ⚡

AI-powered product search and selection. The AI suggests relevant products, human reviews and selects.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |





---


### `viewCart` ⚡

View and manage shopping cart. Review cart items, adjust quantities, or remove items.





---


### `checkout` ⚡

Complete the checkout process. Review final cart and confirm purchase.





---


### `cartStatus`

Get current cart status





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph shopping_cart["📦 Shopping Cart"]
        direction TB
        PHOTON((🎯))
        T0[🌊 search (stream)]
        PHOTON --> T0
        T1[🌊 viewCart (stream)]
        PHOTON --> T1
        T2[🌊 checkout (stream)]
        PHOTON --> T2
        T3[🔧 cartStatus]
        PHOTON --> T3
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add shopping-cart

# Get MCP config for your client
photon info shopping-cart --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Photon Team
