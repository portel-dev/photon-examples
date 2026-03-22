# Web Glow

WebGlow — Automated Website Redesign Pipeline Finds local businesses with ugly websites, redesigns them into polished demos, deploys them for free, and queues outreach. Schedule it daily to generate a steady stream of leads. Pipeline: scan → qualify → redesign → deploy → outreach Each instance (`_use`) targets a niche + city: `_use('nail-salons-sydney')` `_use('wedding-venues-london')` `_use('restaurants-austin')`

> **21 tools** · Workflow Photon · v1.0.0 · MIT

**Platform Features:** `generator` `elicitation` `streaming` `stateful`

## ⚙️ Configuration

No configuration required.



## 📋 Quick Reference

| Method | Description |
|--------|-------------|
| `target` | Configure the pipeline for a niche and city |
| `scan` | Add businesses found from scraping Google Maps or other sources. |
| `qualify` | Submit qualification results for scanned businesses. |
| `pending` | Get businesses that need qualifying (scanned but not yet assessed) |
| `redesign` | Store a redesigned website HTML for a qualified lead. |
| `queue` | Get leads ready for redesign (qualified but not yet redesigned). |
| `deploy` | Record a deployed site with its live URL. |
| `draft` | Generate an outreach email draft for a deployed site. |
| `send` | Send the outreach email via Google Workspace CLI. |
| `contacted` | Mark a business as contacted |
| `followup` | Schedule a follow-up via Google Calendar. |
| `ready` | Batch outreach — send emails and schedule follow-ups for all ready leads. |
| `discover` | Find email addresses for businesses that don't have one. |
| `nomail` | List businesses that still need email discovery |
| `config` | Configure your brand name, services, and payment link |
| `showcase` | Generate a showcase page for a deployed site. |
| `showcased` | Record a deployed showcase URL |
| `pipeline` ⚡ | Run the full pipeline as an interactive step-by-step workflow. |
| `status` | Pipeline dashboard — overview of all stages |
| `sites` | View all deployed sites ready for outreach |
| `history` | Run history |


## 🔧 Tools


### `target`

Configure the pipeline for a niche and city


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `niche` | any | Yes | Business type to target (e.g. `nail salons`) |
| `city` | string } | Yes | City to search in (e.g. `Sydney`) |





---


### `scan`

Add businesses found from scraping Google Maps or other sources. Feed the results of your scraping tool here. Each business needs at minimum a name and website URL. Email is needed for outreach.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `businesses` | any | Yes | Array of businesses found |





---


### `qualify`

Submit qualification results for scanned businesses. After screenshotting and assessing each website, submit the results here. Use `agent-browser open <url>` then `agent-browser screenshot <path>` to capture each site. Assess whether it's worth redesigning based on: - Outdated visual design (pre-2015 aesthetics) - Broken or table-based layouts - Poor typography and color choices - Missing mobile responsiveness - Cluttered or confusing navigation - No clear call-to-action


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `results` | any | Yes | Array of qualification results |





---


### `pending`

Get businesses that need qualifying (scanned but not yet assessed)





---


### `redesign`

Store a redesigned website HTML for a qualified lead. The calling LLM should generate a polished single-page HTML design using the business's real content, verified stock photos, and modern design principles. Each design should look like a $5,000+ custom build.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | The original website URL (to match the lead) |
| `html` | string | Yes | The complete HTML of the redesigned site |
| `notes` | string | Yes | Design notes explaining choices made |





---


### `queue`

Get leads ready for redesign (qualified but not yet redesigned). Returns business info and issues to address in the redesign.





---


### `deploy`

Record a deployed site with its live URL. After deploying to Vercel, Netlify, or any host, record the live URL here so it can be included in outreach.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL (to match the redesign) |
| `liveUrl` | string } | Yes | The deployed demo URL |





---


### `draft`

Generate an outreach email draft for a deployed site. Returns the business details and demo URL so the calling LLM can craft a personalized cold email.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |





---


### `send`

Send the outreach email via Google Workspace CLI. Uses `gws gmail +send` to send the email directly from your Gmail. Requires `gws auth login` to be done once beforehand.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |
| `subject` | string | Yes | Email subject line |
| `body` | string | Yes | Email body (plain text or HTML) |





---


### `contacted`

Mark a business as contacted


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |





---


### `followup`

Schedule a follow-up via Google Calendar. Creates a calendar event to follow up with a lead after sending the initial outreach. Uses `gws calendar +insert`.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |
| `daysFromNow` | number | No | Days until follow-up (e.g. `3`) |
| `notes` | string | No | Notes for the follow-up event |





---


### `ready`

Batch outreach — send emails and schedule follow-ups for all ready leads. Returns the gws commands for each lead. The calling LLM should first generate the email with `draft`, then execute `send`, then `followup`.





---


### `discover`

Find email addresses for businesses that don't have one. Use agent-browser to check the business website's contact page, footer, about page, and social media links. Updates the business record with the discovered email.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Business website URL |
| `email` | string } | Yes | Discovered email address |





---


### `nomail`

List businesses that still need email discovery





---


### `config`

Configure your brand name, services, and payment link


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brand` | any | Yes | Your business/brand name (e.g. `WebGlow Studio`) |
| `payment` | string | Yes | Payment link URL (Stripe, PayPal, etc.) (e.g. `https://buy.stripe.com/xxx`) |
| `services` | ServiceTier[] | No | Optional custom service tiers |





---


### `showcase`

Generate a showcase page for a deployed site. Creates a self-contained HTML page with: - Before/after screenshots side by side - Service tiers with pricing - Payment/contact link - Professional branding. Deploy this page and send the URL in outreach emails.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |
| `beforeImg` | string | Yes | Path or URL of the old website screenshot |
| `afterImg` | string | Yes | Path or URL of the new website screenshot |





---


### `showcased`

Record a deployed showcase URL


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `website` | any | Yes | Original website URL |
| `showcaseUrl` | string } | Yes | The deployed showcase page URL |





---


### `pipeline` ⚡

Run the full pipeline as an interactive step-by-step workflow. Walks through scan → qualify → redesign → deploy → outreach with the calling LLM doing the heavy lifting at each step.


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `niche` | any | Yes | Business type (e.g. `nail salons`) |
| `city` | string | Yes | City to search (e.g. `Sydney`) |
| `limit` | number | No | Max businesses to process (e.g. `10`) |





---


### `status`

Pipeline dashboard — overview of all stages





---


### `sites`

View all deployed sites ready for outreach





---


### `history`

Run history





---





## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph web_glow["📦 Web Glow"]
        START([▶ Start])
        N0[📣 render]
        START --> N0
        N1{❓ Search Google Maps for }
        N0 --> N1
        N2[📢 Found ${this.state.scanned....]
        N1 --> N2
        N3[📣 render]
        N2 --> N3
        N4{❓ Visit each website and...}
        N3 --> N4
        N5[📢 ${worth.length} sites worth...]
        N4 --> N5
        N6[📣 render]
        N5 --> N6
        N7{❓ Redesign ${lead.name}}
        N6 --> N7
        N8[📢 Redesigned ${lead.name}]
        N7 --> N8
        N9{❓ Deploy the HTML file a...}
        N8 --> N9
        N10[📢 Deployed ${site.business.na...]
        N9 --> N10
        SUCCESS([✅ Success])
        N10 --> SUCCESS
    end
```


## 📥 Usage

```bash
# Install from marketplace
photon add web-glow

# Get MCP config for your client
photon info web-glow --mcp
```

## 📦 Dependencies

No external dependencies.

---

MIT · v1.0.0
