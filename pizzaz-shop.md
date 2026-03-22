# Pizzaz Shop

AI Pizza Ordering Assistant Demonstrates the AI+Human transaction workflow for food ordering: 1. AI suggests pizzas based on preferences 2. Human selects and customizes items 3. Human reviews cart and confirms order 4. System processes order with delivery info

> **5 tools** · Streaming Photon · v1.0.0 · MIT

**Platform Features:** `generator`

## ⚙️ Configuration

No configuration required.




## 🔧 Tools


### `browseMenu` ⚡

Browse the pizza menu. Filter by category and select pizzas to add to cart.





---


### `recommend` ⚡

Get AI pizza recommendations. Tell us your preferences and we'll suggest the perfect pizzas!


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `preferences` | string | Yes | What kind of pizza are you in the mood for? |





---


### `viewCart` ⚡

View and modify your cart. Adjust quantities, remove items, or proceed to checkout.





---


### `checkout` ⚡

Complete your order. Review cart, enter delivery info, and place your order!





---


### `cartStatus`

Get cart status





---





## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph pizzaz_shop["📦 Pizzaz Shop"]
        direction TB
        PHOTON((🎯))
        T0[🌊 browseMenu (stream)]
        PHOTON --> T0
        T1[🌊 recommend (stream)]
        PHOTON --> T1
        T2[🌊 viewCart (stream)]
        PHOTON --> T2
        T3[🌊 checkout (stream)]
        PHOTON --> T3
        T4[🔧 cartStatus]
        PHOTON --> T4
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add pizzaz-shop

# Get MCP config for your client
photon info pizzaz-shop --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0 · Photon Team
