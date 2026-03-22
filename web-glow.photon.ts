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
 * | Step | Tool | Cost | Alternative |
 * |------|------|------|-------------|
 * | Scan | Playwright + Google Maps | Free | Google Places API (5k/mo free) |
 * | Qualify | Playwright screenshots | Free | — |
 * | Redesign | LLM + Unsplash photos | LLM tokens | — |
 * | Deploy | Vercel / Netlify / GitHub Pages | Free tier | Any static host |
 * | Outreach | LLM drafts email | LLM tokens | — |
 *
 * No paid APIs required. The LLM drives each step using browser
 * automation (Playwright) and free hosting. Apify is optional if
 * you want faster bulk scraping (~$0.20/50 listings).
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
  deployedAt: string;
}

interface PipelineState {
  niche: string;
  city: string;
  scanned: Business[];
  qualified: QualifiedLead[];
  redesigned: RedesignedSite[];
  deployed: DeployedSite[];
  contacted: string[];
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
   * The calling LLM should visit each site, take a screenshot, and assess
   * whether it's worth redesigning based on these signals:
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

    return `## Draft Outreach Email

**To:** ${deployed.business.name}
**Email:** ${deployed.business.email || '(find their email)'}
**Their site:** ${deployed.business.website}
**Your demo:** ${deployed.liveUrl}

### Context
- Business: ${deployed.business.name} (${deployed.business.category || this.state.niche})
- Location: ${deployed.business.address || this.state.city}
- Issues found: ${deployed.business.issues.join(', ')}

### Guidelines
- Lead with the demo link — show, don't tell
- Reference something specific about their business (shows you looked)
- Keep it under 100 words
- No hard sell — just "I noticed your website could use a refresh, so I made this demo"
- Include a clear next step (reply, book a call)

Write a short, personalized cold email following these guidelines.`;
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
      message: `Search Google Maps for "${niche}" in "${city}". Find up to ${max} businesses that have both a website and an email address.\n\nUse Playwright to browse Google Maps (free), or the Google Places API if available. Apify is optional but not required.\n\nReturn JSON array: [{name, website, email, phone, address, category}]`,
    };

    if (scanRequest && Array.isArray(scanRequest)) {
      this.scan({ businesses: scanRequest });
      yield { emit: 'status', message: `Found ${this.state.scanned.length} businesses` };
    }

    // Step 2: Ask LLM to qualify
    yield { emit: 'render', format: 'markdown', value: `## Step 2: Qualifying ${this.state.scanned.length} websites\n\nVisit each website, screenshot it, and assess quality.` };

    const qualifyRequest = yield {
      ask: 'qualify',
      message: `Visit each of these websites and assess their design quality. For each, determine if it's worth redesigning.\n\n${this.state.scanned.map(b => `- ${b.name}: ${b.website}`).join('\n')}\n\nReturn JSON array: [{name, website, email, qualityScore ("poor"|"outdated"|"acceptable"|"good"), issues: string[], worthRedesigning: boolean}]`,
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
        message: `Redesign ${lead.name}'s website (${lead.website}). Visit their current site, read their content, and generate a single polished HTML file. Use modern design (clean typography, good spacing, mobile-responsive). Include their real business info. Use Unsplash for stock photos. Return the complete HTML.`,
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
