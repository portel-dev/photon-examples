/**
 * WebGlow — Automated Website Redesign Pipeline
 *
 * Finds local businesses with ugly websites, redesigns them into
 * polished demos, deploys them for free, and queues outreach.
 * Schedule it daily to generate a steady stream of leads.
 *
 * Pipeline: scan → qualify → redesign → deploy → outreach
 *
 * Each instance (`_use`) targets a niche + city:
 *   `_use('nail-salons-sydney')`
 *   `_use('wedding-venues-london')`
 *   `_use('restaurants-austin')`
 *
 * ## Tools (all free)
 *
 * | Step | Tool | Cost |
 * |------|------|------|
 * | Scan | `agent-browser` → Google Maps | Free |
 * | Qualify | `agent-browser screenshot` | Free |
 * | Redesign | LLM + Unsplash photos | LLM tokens only |
 * | Deploy | Vercel / Netlify / GitHub Pages | Free tier |
 * | Send | `gws gmail +send` (Google Workspace CLI) | Free |
 * | Follow-up | `gws calendar +insert` | Free |
 * | Outreach | LLM drafts email | LLM tokens only |
 *
 * No paid APIs required. Uses `agent-browser` CLI for browser automation
 * and `gws` (Google Workspace CLI) for sending email and calendar events.
 * Setup: `npm install -g @googleworkspace/cli && gws auth login`
 *
 * agent-browser commands:
 *   `agent-browser open <url>` — navigate to page
 *   `agent-browser snapshot -i` — get interactive elements with refs
 *   `agent-browser click @e1` / `fill @e2 "text"` — interact
 *   `agent-browser screenshot <path>` — capture full page
 *
 * @version 1.0.0
 * @stateful
 * @icon ✨
 * @tags business, automation, web-design, outreach, leads
 */

import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Business {
  name: string;
  website: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  category?: string;
}

interface QualifiedLead extends Business {
  screenshotPath?: string;
  qualityScore: 'poor' | 'outdated' | 'acceptable' | 'good';
  issues: string[];
  worthRedesigning: boolean;
}

interface RedesignedSite {
  business: QualifiedLead;
  htmlPath: string;
  designNotes: string;
  generatedAt: string;
}

interface DeployedSite extends RedesignedSite {
  liveUrl: string;
  showcaseUrl?: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  deployedAt: string;
}

interface ServiceTier {
  name: string;
  price: string;
  features: string[];
}

const DEFAULT_SERVICES: ServiceTier[] = [
  {
    name: 'Design Only',
    price: '$499',
    features: [
      'The redesigned website you see here',
      'Mobile-responsive layout',
      'Source HTML files delivered',
    ],
  },
  {
    name: 'Launch Package',
    price: '$999',
    features: [
      'Everything in Design Only',
      'Deployed to your domain',
      'Contact form setup',
      'Google Maps integration',
      'Basic SEO optimization',
    ],
  },
  {
    name: 'Full Service',
    price: '$1,999',
    features: [
      'Everything in Launch Package',
      'Integrated with your booking system',
      'Social media links & feeds',
      'Google Analytics setup',
      'Monthly maintenance (3 months)',
      'Content updates on request',
    ],
  },
];

interface PipelineState {
  niche: string;
  city: string;
  scanned: Business[];
  qualified: QualifiedLead[];
  redesigned: RedesignedSite[];
  deployed: DeployedSite[];
  contacted: string[];
  services: ServiceTier[];
  paymentLink: string;
  brandName: string;
  runs: Array<{
    date: string;
    scanned: number;
    qualified: number;
    redesigned: number;
    deployed: number;
    contacted: number;
  }>;
}

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'web-glow');

export default class WebGlow {
  private state: PipelineState = {
    niche: '', city: '',
    scanned: [], qualified: [], redesigned: [], deployed: [], contacted: [],
    services: [...DEFAULT_SERVICES],
    paymentLink: '',
    brandName: 'WebGlow',
    runs: [],
  };

  private get outputDir() {
    const slug = `${this.state.niche}-${this.state.city}`.replace(/\s+/g, '-').toLowerCase();
    const dir = path.join(DATA_DIR, slug);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  // ── Setup ────────────────────────────────────────────────

  /**
   * Configure the pipeline for a niche and city
   *
   * @param niche Business type to target {@example nail salons}
   * @param city City to search in {@example Sydney}
   */
  target({ niche, city }: { niche: string; city: string }) {
    this.state.niche = niche;
    this.state.city = city;
    return {
      niche,
      city,
      outputDir: this.outputDir,
      pipeline: 'scan → qualify → redesign → deploy → outreach',
    };
  }

  // ── Step 1: Scan ─────────────────────────────────────────

  /**
   * Add businesses found from scraping Google Maps or other sources
   *
   * Feed the results of your scraping tool here. Each business needs
   * at minimum a name and website URL. Email is needed for outreach.
   *
   * @param businesses Array of businesses found
   */
  scan({ businesses }: { businesses: Business[] }) {
    for (const biz of businesses) {
      if (!biz.name || !biz.website) continue;
      const exists = this.state.scanned.find(
        b => b.website.replace(/\/$/, '') === biz.website.replace(/\/$/, '')
      );
      if (!exists) this.state.scanned.push(biz);
    }
    return {
      added: businesses.length,
      total: this.state.scanned.length,
      withEmail: this.state.scanned.filter(b => b.email).length,
      next: 'Run `qualify` to screenshot and assess each website',
    };
  }

  // ── Step 2: Qualify ──────────────────────────────────────

  /**
   * Submit qualification results for scanned businesses
   *
   * After screenshotting and assessing each website, submit the results here.
   * Use `agent-browser open <url>` then `agent-browser screenshot <path>`
   * to capture each site. Assess whether it's worth redesigning based on:
   * - Outdated visual design (pre-2015 aesthetics)
   * - Broken or table-based layouts
   * - Poor typography and color choices
   * - Missing mobile responsiveness
   * - Cluttered or confusing navigation
   * - No clear call-to-action
   *
   * @param results Array of qualification results
   */
  qualify({ results }: { results: QualifiedLead[] }) {
    for (const lead of results) {
      const existing = this.state.qualified.findIndex(
        q => q.website === lead.website
      );
      if (existing >= 0) {
        this.state.qualified[existing] = lead;
      } else {
        this.state.qualified.push(lead);
      }
    }

    const worth = this.state.qualified.filter(q => q.worthRedesigning);
    return {
      assessed: results.length,
      totalQualified: this.state.qualified.length,
      worthRedesigning: worth.length,
      skipped: this.state.qualified.length - worth.length,
      leads: worth.map(q => ({
        name: q.name,
        website: q.website,
        score: q.qualityScore,
        issues: q.issues.join(', '),
      })),
      next: worth.length > 0
        ? 'Run `redesign` to generate beautiful replacements'
        : 'No leads worth redesigning. Try scanning more businesses.',
    };
  }

  /**
   * Get businesses that need qualifying (scanned but not yet assessed)
   *
   * @format table
   * @readOnly
   */
  pending() {
    const qualifiedUrls = new Set(this.state.qualified.map(q => q.website));
    return this.state.scanned
      .filter(b => !qualifiedUrls.has(b.website))
      .map(b => ({ name: b.name, website: b.website, email: b.email || '—' }));
  }

  // ── Step 3: Redesign ─────────────────────────────────────

  /**
   * Store a redesigned website HTML for a qualified lead
   *
   * The calling LLM should generate a polished single-page HTML design
   * using the business's real content, verified stock photos, and modern
   * design principles. Each design should look like a $5,000+ custom build.
   *
   * @param website The original website URL (to match the lead)
   * @param html The complete HTML of the redesigned site
   * @param notes Design notes explaining choices made
   */
  async redesign({ website, html, notes }: {
    website: string;
    html: string;
    notes: string;
  }) {
    const lead = this.state.qualified.find(
      q => q.website === website && q.worthRedesigning
    );
    if (!lead) throw new Error(`No qualified lead found for ${website}`);

    const slug = lead.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const htmlPath = path.join(this.outputDir, `${slug}.html`);
    await fs.writeFile(htmlPath, html, 'utf-8');

    const existing = this.state.redesigned.findIndex(
      r => r.business.website === website
    );
    const entry: RedesignedSite = {
      business: lead,
      htmlPath,
      designNotes: notes,
      generatedAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      this.state.redesigned[existing] = entry;
    } else {
      this.state.redesigned.push(entry);
    }

    return {
      name: lead.name,
      saved: htmlPath,
      size: `${(html.length / 1024).toFixed(1)} KB`,
      next: 'Run `deploy` to publish it to a live URL',
    };
  }

  /**
   * Get leads ready for redesign (qualified but not yet redesigned)
   *
   * Returns business info and issues to address in the redesign.
   *
   * @format table
   * @readOnly
   */
  queue() {
    const redesignedUrls = new Set(this.state.redesigned.map(r => r.business.website));
    return this.state.qualified
      .filter(q => q.worthRedesigning && !redesignedUrls.has(q.website))
      .map(q => ({
        name: q.name,
        website: q.website,
        issues: q.issues.join(', '),
      }));
  }

  // ── Step 4: Deploy ───────────────────────────────────────

  /**
   * Record a deployed site with its live URL
   *
   * After deploying to Vercel, Netlify, or any host, record the live URL
   * here so it can be included in outreach.
   *
   * @param website Original website URL (to match the redesign)
   * @param liveUrl The deployed demo URL
   */
  deploy({ website, liveUrl }: { website: string; liveUrl: string }) {
    const redesign = this.state.redesigned.find(
      r => r.business.website === website
    );
    if (!redesign) throw new Error(`No redesign found for ${website}`);

    const entry: DeployedSite = {
      ...redesign,
      liveUrl,
      deployedAt: new Date().toISOString(),
    };

    const existing = this.state.deployed.findIndex(
      d => d.business.website === website
    );
    if (existing >= 0) {
      this.state.deployed[existing] = entry;
    } else {
      this.state.deployed.push(entry);
    }

    return {
      name: redesign.business.name,
      liveUrl,
      email: redesign.business.email || '(no email)',
      next: redesign.business.email
        ? 'Ready for outreach — run `draft` to generate email'
        : 'No email on file — manual outreach needed',
    };
  }

  // ── Step 5: Outreach ─────────────────────────────────────

  /**
   * Generate an outreach email draft for a deployed site
   *
   * Returns the business details and demo URL so the calling LLM
   * can craft a personalized cold email.
   *
   * @param website Original website URL
   * @format markdown
   */
  draft({ website }: { website: string }) {
    const deployed = this.state.deployed.find(
      d => d.business.website === website
    );
    if (!deployed) throw new Error(`No deployed site for ${website}`);

    const showcaseUrl = deployed.showcaseUrl;
    const mainLink = showcaseUrl || deployed.liveUrl;

    return `## Draft Outreach Email

**To:** ${deployed.business.name}
**Email:** ${deployed.business.email || '(find their email — run \`discover\`)'}
**Their site:** ${deployed.business.website}
**Showcase page:** ${showcaseUrl || '(not yet — run \`showcase\` first)'}
**Live demo:** ${deployed.liveUrl}

### Context
- Business: ${deployed.business.name} (${deployed.business.category || this.state.niche})
- Location: ${deployed.business.address || this.state.city}
- Issues found: ${deployed.business.issues.join(', ')}
- Your brand: ${this.state.brandName}

### What to link
${showcaseUrl
  ? `Link to the showcase page (${showcaseUrl}) — it has before/after screenshots, pricing tiers, and a payment button.`
  : `Link to the live demo (${deployed.liveUrl}). Consider running \`showcase\` first to create a page with before/after comparison, pricing, and payment link.`}

### Guidelines
- Subject line: reference their business name + one specific issue
- Lead with the showcase link — show, don't tell
- Reference something specific about their business (shows you looked)
- Keep it under 100 words
- No hard sell — "I noticed your website could use a refresh, so I made this preview"
- Clear next step: "See the redesign and pick a plan that works for you"
- If no showcase page, just share the demo URL and offer to discuss

Write a short, personalized cold email following these guidelines.`;
  }

  /**
   * Send the outreach email via Google Workspace CLI
   *
   * Uses `gws gmail +send` to send the email directly from your Gmail.
   * Requires `gws auth login` to be done once beforehand.
   *
   * @param website Original website URL
   * @param subject Email subject line
   * @param body Email body (plain text or HTML)
   */
  async send({ website, subject, body }: {
    website: string;
    subject: string;
    body: string;
  }) {
    const deployed = this.state.deployed.find(
      d => d.business.website === website
    );
    if (!deployed) throw new Error(`No deployed site for ${website}`);
    if (!deployed.business.email) throw new Error(`No email for ${deployed.business.name}. Run \`discover\` first.`);

    const email = deployed.business.email;

    // Build gws command
    const cmd = [
      'gws', 'gmail', '+send',
      '--to', email,
      '--subject', subject,
      '--body', body,
    ];

    return {
      command: cmd.join(' '),
      to: email,
      subject,
      business: deployed.business.name,
      hint: `Run this command to send:\n\n\`${cmd.map(c => c.includes(' ') ? `"${c}"` : c).join(' ')}\`\n\nOr use the pipeline's auto-send by confirming.`,
    };
  }

  /**
   * Mark a business as contacted
   *
   * @param website Original website URL
   */
  contacted({ website }: { website: string }) {
    if (!this.state.contacted.includes(website)) {
      this.state.contacted.push(website);
    }
    return { marked: website, totalContacted: this.state.contacted.length };
  }

  /**
   * Schedule a follow-up via Google Calendar
   *
   * Creates a calendar event to follow up with a lead after sending
   * the initial outreach. Uses `gws calendar +insert`.
   *
   * @param website Original website URL
   * @param daysFromNow Days until follow-up {@example 3}
   * @param notes Notes for the follow-up event
   */
  followup({ website, daysFromNow, notes }: {
    website: string;
    daysFromNow?: number;
    notes?: string;
  }) {
    const deployed = this.state.deployed.find(
      d => d.business.website === website
    );
    if (!deployed) throw new Error(`No deployed site for ${website}`);

    const days = daysFromNow || 3;
    const followDate = new Date();
    followDate.setDate(followDate.getDate() + days);
    const dateStr = followDate.toISOString().split('T')[0];

    const biz = deployed.business;
    const summary = `Follow up: ${biz.name} — website redesign`;
    const description = [
      `Business: ${biz.name}`,
      `Email: ${biz.email || 'unknown'}`,
      `Original site: ${biz.website}`,
      `Demo: ${deployed.liveUrl}`,
      deployed.showcaseUrl ? `Showcase: ${deployed.showcaseUrl}` : '',
      notes ? `\nNotes: ${notes}` : '',
    ].filter(Boolean).join('\n');

    const cmd = [
      'gws', 'calendar', '+insert',
      '--summary', `"${summary}"`,
      '--date', dateStr,
      '--description', `"${description}"`,
    ];

    return {
      command: cmd.join(' '),
      date: dateStr,
      summary,
      business: biz.name,
      hint: `Run this command to create the calendar event:\n\n\`${cmd.join(' ')}\``,
    };
  }

  /**
   * Batch outreach — send emails and schedule follow-ups for all ready leads
   *
   * Returns the gws commands for each lead. The calling LLM should
   * first generate the email with `draft`, then execute `send`, then `followup`.
   *
   * @format table
   * @readOnly
   */
  ready() {
    return this.state.deployed
      .filter(d => d.business.email && !this.state.contacted.includes(d.business.website))
      .map(d => ({
        name: d.business.name,
        email: d.business.email,
        demo: d.liveUrl,
        showcase: d.showcaseUrl || '—',
        status: 'ready to send',
      }));
  }

  // ── Email Discovery ───────────────────────────────────────

  /**
   * Find email addresses for businesses that don't have one
   *
   * Use agent-browser to check the business website's contact page,
   * footer, about page, and social media links. Updates the business
   * record with the discovered email.
   *
   * @param website Business website URL
   * @param email Discovered email address
   */
  discover({ website, email }: { website: string; email: string }) {
    const biz = this.state.scanned.find(
      b => b.website.replace(/\/$/, '') === website.replace(/\/$/, '')
    );
    if (biz) biz.email = email;

    const lead = this.state.qualified.find(
      q => q.website.replace(/\/$/, '') === website.replace(/\/$/, '')
    );
    if (lead) lead.email = email;

    const deployed = this.state.deployed.find(
      d => d.business.website.replace(/\/$/, '') === website.replace(/\/$/, '')
    );
    if (deployed) deployed.business.email = email;

    return { website, email, updated: true };
  }

  /**
   * List businesses that still need email discovery
   *
   * @format table
   * @readOnly
   */
  nomail() {
    return this.state.qualified
      .filter(q => q.worthRedesigning && !q.email)
      .map(q => ({
        name: q.name,
        website: q.website,
        hint: 'Use agent-browser to check contact page, footer, about page, social links',
      }));
  }

  // ── Showcase & Pricing ───────────────────────────────────

  /**
   * Configure your brand name, services, and payment link
   *
   * @param brand Your business/brand name {@example WebGlow Studio}
   * @param payment Payment link URL (Stripe, PayPal, etc.) {@example https://buy.stripe.com/xxx}
   * @param services Optional custom service tiers
   */
  config({ brand, payment, services }: {
    brand: string;
    payment: string;
    services?: ServiceTier[];
  }) {
    this.state.brandName = brand;
    this.state.paymentLink = payment;
    if (services) this.state.services = services;
    return {
      brand: this.state.brandName,
      paymentLink: this.state.paymentLink,
      tiers: this.state.services.map(s => `${s.name}: ${s.price}`),
    };
  }

  /**
   * Generate a showcase page for a deployed site
   *
   * Creates a self-contained HTML page with:
   * - Before/after screenshots side by side
   * - Service tiers with pricing
   * - Payment/contact link
   * - Professional branding
   *
   * Deploy this page and send the URL in outreach emails.
   *
   * @param website Original website URL
   * @param beforeImg Path or URL of the old website screenshot
   * @param afterImg Path or URL of the new website screenshot
   */
  async showcase({ website, beforeImg, afterImg }: {
    website: string;
    beforeImg: string;
    afterImg: string;
  }) {
    const deployed = this.state.deployed.find(
      d => d.business.website === website
    );
    if (!deployed) throw new Error(`No deployed site for ${website}. Deploy first.`);

    deployed.beforeScreenshot = beforeImg;
    deployed.afterScreenshot = afterImg;

    const biz = deployed.business;
    const brand = this.state.brandName;
    const payment = this.state.paymentLink;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${biz.name} — Website Redesign by ${brand}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; background: #fafafa; }
  .hero { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; padding: 80px 24px; text-align: center; }
  .hero h1 { font-size: 2.5rem; margin-bottom: 12px; }
  .hero p { font-size: 1.2rem; opacity: 0.85; max-width: 600px; margin: 0 auto; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .comparison { padding: 60px 0; }
  .comparison h2 { text-align: center; font-size: 2rem; margin-bottom: 40px; }
  .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
  .compare-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .compare-card img { width: 100%; display: block; }
  .compare-label { padding: 16px 24px; font-weight: 600; font-size: 1.1rem; }
  .compare-label.before { color: #e74c3c; }
  .compare-label.after { color: #27ae60; }
  .live-link { text-align: center; margin: 24px 0 60px; }
  .live-link a { color: #302b63; font-weight: 600; text-decoration: none; border-bottom: 2px solid #302b63; padding-bottom: 2px; }
  .services { background: white; padding: 60px 0; }
  .services h2 { text-align: center; font-size: 2rem; margin-bottom: 40px; }
  .tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .tier { border: 2px solid #e8e8e8; border-radius: 16px; padding: 32px; text-align: center; transition: border-color 0.2s, transform 0.2s; }
  .tier:hover { border-color: #302b63; transform: translateY(-4px); }
  .tier.featured { border-color: #302b63; background: #f8f7ff; }
  .tier h3 { font-size: 1.3rem; margin-bottom: 8px; }
  .tier .price { font-size: 2.2rem; font-weight: 700; color: #302b63; margin-bottom: 16px; }
  .tier ul { list-style: none; text-align: left; margin-bottom: 24px; }
  .tier li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
  .tier li::before { content: "✓ "; color: #27ae60; font-weight: bold; }
  .cta-btn { display: inline-block; background: #302b63; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: background 0.2s; }
  .cta-btn:hover { background: #1a1a2e; }
  .footer { text-align: center; padding: 40px 24px; color: #888; font-size: 0.9rem; }
  @media (max-width: 768px) { .compare-grid { grid-template-columns: 1fr; } .hero h1 { font-size: 1.8rem; } }
</style>
</head>
<body>
  <div class="hero">
    <h1>Your Website, Reimagined</h1>
    <p>Hi ${biz.name} — we redesigned your website to show you what's possible. No commitment, just a preview.</p>
  </div>

  <div class="container">
    <div class="comparison">
      <h2>Before & After</h2>
      <div class="compare-grid">
        <div class="compare-card">
          <div class="compare-label before">Current Website</div>
          <img src="${beforeImg}" alt="Current ${biz.name} website">
        </div>
        <div class="compare-card">
          <div class="compare-label after">Redesigned Version</div>
          <img src="${afterImg}" alt="Redesigned ${biz.name} website">
        </div>
      </div>
      <div class="live-link">
        <a href="${deployed.liveUrl}" target="_blank">View the live redesign →</a>
      </div>
    </div>
  </div>

  <div class="services">
    <div class="container">
      <h2>Make It Yours</h2>
      <div class="tier-grid">
        ${this.state.services.map((tier, i) => `
        <div class="tier${i === 1 ? ' featured' : ''}">
          <h3>${tier.name}</h3>
          <div class="price">${tier.price}</div>
          <ul>${tier.features.map(f => `<li>${f}</li>`).join('')}</ul>
          <a href="${payment || '#contact'}" class="cta-btn">Get Started</a>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Prepared for ${biz.name} by ${brand}</p>
  </div>
</body>
</html>`;

    const slug = biz.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const showcasePath = path.join(this.outputDir, `${slug}-showcase.html`);
    await fs.writeFile(showcasePath, html, 'utf-8');

    return {
      name: biz.name,
      showcasePath,
      size: `${(html.length / 1024).toFixed(1)} KB`,
      next: `Deploy this showcase page and use the URL in your outreach email.\nRun \`deploy\` or use \`vercel ${showcasePath} --yes\``,
    };
  }

  /**
   * Record a deployed showcase URL
   *
   * @param website Original website URL
   * @param showcaseUrl The deployed showcase page URL
   */
  showcased({ website, showcaseUrl }: { website: string; showcaseUrl: string }) {
    const deployed = this.state.deployed.find(
      d => d.business.website === website
    );
    if (!deployed) throw new Error(`No deployed site for ${website}`);
    deployed.showcaseUrl = showcaseUrl;
    return { name: deployed.business.name, showcaseUrl };
  }

  // ── Full Pipeline ────────────────────────────────────────

  /**
   * Run the full pipeline as an interactive step-by-step workflow
   *
   * Walks through scan → qualify → redesign → deploy → outreach
   * with the calling LLM doing the heavy lifting at each step.
   *
   * @param niche Business type {@example nail salons}
   * @param city City to search {@example Sydney}
   * @param limit Max businesses to process {@example 10}
   */
  async *pipeline({ niche, city, limit }: {
    niche: string;
    city: string;
    limit?: number;
  }) {
    this.target({ niche, city });
    const max = limit || 20;

    yield { emit: 'render', format: 'markdown', value: `# WebGlow Pipeline\n\n**${niche}** in **${city}** (up to ${max} businesses)\n\n---` };

    // Step 1: Ask LLM to scan
    const scanRequest = yield {
      ask: 'scan',
      message: `Search Google Maps for "${niche}" in "${city}". Find up to ${max} businesses that have both a website and an email address.\n\nUse agent-browser:\n  1. \`agent-browser open "https://www.google.com/maps/search/${encodeURIComponent(niche + ' in ' + city)}"\`\n  2. \`agent-browser snapshot -i\` to get listing elements\n  3. Click each listing, extract name, website, email, phone, address\n  4. Re-snapshot after page changes\n\nReturn JSON array: [{name, website, email, phone, address, category}]`,
    };

    if (scanRequest && Array.isArray(scanRequest)) {
      this.scan({ businesses: scanRequest });
      yield { emit: 'status', message: `Found ${this.state.scanned.length} businesses` };
    }

    // Step 2: Ask LLM to qualify
    yield { emit: 'render', format: 'markdown', value: `## Step 2: Qualifying ${this.state.scanned.length} websites\n\nVisit each website, screenshot it, and assess quality.` };

    const qualifyRequest = yield {
      ask: 'qualify',
      message: `Visit each website and assess its design quality. For each:\n  1. \`agent-browser open "<url>"\`\n  2. \`agent-browser screenshot /tmp/webglow-<name>.png\`\n  3. View the screenshot and assess quality\n\nWebsites to assess:\n${this.state.scanned.map(b => `- ${b.name}: ${b.website}`).join('\n')}\n\nReturn JSON array: [{name, website, email, qualityScore ("poor"|"outdated"|"acceptable"|"good"), issues: string[], worthRedesigning: boolean}]`,
    };

    if (qualifyRequest && Array.isArray(qualifyRequest)) {
      this.qualify({ results: qualifyRequest });
      const worth = this.state.qualified.filter(q => q.worthRedesigning);
      yield { emit: 'status', message: `${worth.length} sites worth redesigning` };
    }

    // Step 3: Ask LLM to redesign each qualified lead
    const toRedesign = this.state.qualified.filter(q => q.worthRedesigning);
    for (const lead of toRedesign) {
      yield { emit: 'render', format: 'markdown', value: `## Redesigning: ${lead.name}\n\nOriginal: ${lead.website}\nIssues: ${lead.issues.join(', ')}` };

      const redesignResult = yield {
        ask: 'redesign',
        message: `Redesign ${lead.name}'s website (${lead.website}).\n\n1. \`agent-browser open "${lead.website}"\` and \`agent-browser snapshot -i\` to read their content\n2. Extract business name, services, story, contact info, address\n3. Generate a single polished HTML file with:\n   - Modern design (clean typography, good spacing, mobile-responsive)\n   - Their real business info from the current site\n   - Unsplash stock photos (use \`https://source.unsplash.com/800x600/?keyword\`)\n   - Google Maps embed for their address\n4. Return the complete HTML.`,
      };

      if (redesignResult && typeof redesignResult === 'string') {
        await this.redesign({
          website: lead.website,
          html: redesignResult,
          notes: `Auto-redesign of ${lead.name}`,
        });
        yield { emit: 'status', message: `Redesigned ${lead.name}` };
      }
    }

    // Step 4: Deploy
    for (const site of this.state.redesigned) {
      if (this.state.deployed.find(d => d.business.website === site.business.website)) continue;

      const deployResult = yield {
        ask: 'deploy',
        message: `Deploy the HTML file at ${site.htmlPath} to a free static host (Vercel, Netlify, or GitHub Pages). Use the CLI tool (e.g., \`vercel --yes\`). Return the live URL.`,
      };

      if (deployResult && typeof deployResult === 'string') {
        this.deploy({ website: site.business.website, liveUrl: deployResult });
        yield { emit: 'status', message: `Deployed ${site.business.name}: ${deployResult}` };
      }
    }

    // Log the run
    this.state.runs.push({
      date: new Date().toISOString(),
      scanned: this.state.scanned.length,
      qualified: this.state.qualified.filter(q => q.worthRedesigning).length,
      redesigned: this.state.redesigned.length,
      deployed: this.state.deployed.length,
      contacted: this.state.contacted.length,
    });

    return {
      summary: {
        niche,
        city,
        scanned: this.state.scanned.length,
        qualified: this.state.qualified.filter(q => q.worthRedesigning).length,
        redesigned: this.state.redesigned.length,
        deployed: this.state.deployed.length,
      },
      readyForOutreach: this.state.deployed
        .filter(d => d.business.email && !this.state.contacted.includes(d.business.website))
        .map(d => ({ name: d.business.name, email: d.business.email, demoUrl: d.liveUrl })),
    };
  }

  // ── Dashboard ────────────────────────────────────────────

  /**
   * Pipeline dashboard — overview of all stages
   *
   * @format kv
   * @readOnly
   */
  status() {
    return {
      niche: this.state.niche || '(not set)',
      city: this.state.city || '(not set)',
      scanned: this.state.scanned.length,
      qualified: this.state.qualified.filter(q => q.worthRedesigning).length,
      redesigned: this.state.redesigned.length,
      deployed: this.state.deployed.length,
      contacted: this.state.contacted.length,
      totalRuns: this.state.runs.length,
    };
  }

  /**
   * View all deployed sites ready for outreach
   *
   * @format table
   * @readOnly
   */
  sites() {
    return this.state.deployed.map(d => ({
      name: d.business.name,
      original: d.business.website,
      demo: d.liveUrl,
      email: d.business.email || '—',
      contacted: this.state.contacted.includes(d.business.website) ? 'Yes' : 'No',
    }));
  }

  /**
   * Run history
   *
   * @format table
   * @readOnly
   */
  history() {
    return this.state.runs.map((r, i) => ({
      '#': i + 1,
      date: r.date.split('T')[0],
      scanned: r.scanned,
      qualified: r.qualified,
      redesigned: r.redesigned,
      deployed: r.deployed,
    }));
  }
}
