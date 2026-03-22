/**
 * Landing Copy — AutoResearch target for landing page copy
 *
 * Implements the AutoResearch interface so autorun can optimize
 * your landing page hero copy based on conversion rates. Stores
 * variants and tracks which ones convert.
 *
 * @version 1.0.0
 * @stateful
 * @icon 🎯
 * @tags auto-research, landing-page, copy, conversion
 */

import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'landing-copy');

export default class LandingCopy {
  private dataDir = DATA_DIR;

  async onInitialize() {
    if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true });

    const promptPath = path.join(this.dataDir, 'prompt.md');
    if (!existsSync(promptPath)) {
      await fs.writeFile(promptPath, DEFAULT_PROMPT, 'utf-8');
    }

    const csvPath = path.join(this.dataDir, 'metrics.csv');
    if (!existsSync(csvPath)) {
      await fs.writeFile(csvPath, 'id,headline,subheadline,cta,conversion_rate,visitors,date\n', 'utf-8');
    }
  }

  // ── AutoResearch Interface ─────────────────────────────

  /**
   * Returns the current landing page copy template
   * @readOnly
   */
  async prompt() {
    return await fs.readFile(path.join(this.dataDir, 'prompt.md'), 'utf-8');
  }

  /**
   * Binary eval criteria for landing page copy
   * @readOnly
   */
  criteria() {
    return [
      { label: 'benefit-first', question: 'Does the headline lead with a benefit, not a feature description?' },
      { label: 'clear-action', question: 'Is it immediately clear what action the visitor should take?' },
      { label: 'specific-outcome', question: 'Does the copy promise a specific, measurable outcome?' },
      { label: 'no-jargon', question: 'Could a non-technical person understand the headline in 3 seconds?' },
      { label: 'social-proof', question: 'Does the copy reference real users, numbers, or results?' },
      { label: 'urgency', question: 'Is there a reason to act now rather than later?' },
      { label: 'one-cta', question: 'Is there exactly one primary call-to-action, not multiple competing ones?' },
      { label: 'scannable', question: 'Can someone understand the value prop by reading only bold/headline text?' },
    ];
  }

  /**
   * Pull conversion data from the metrics CSV
   * @readOnly
   */
  async pull() {
    const csv = await fs.readFile(path.join(this.dataDir, 'metrics.csv'), 'utf-8');
    const lines = csv.trim().split('\n').slice(1);

    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(',');
        const id = parts[0].trim();
        const headline = parts[1]?.replace(/^"|"$/g, '').trim() || '';
        const subheadline = parts[2]?.replace(/^"|"$/g, '').trim() || '';
        const cta = parts[3]?.replace(/^"|"$/g, '').trim() || '';
        const conversionRate = parseFloat(parts[4]?.trim() || '0');
        const visitors = parseInt(parts[5]?.trim() || '0', 10);
        const date = parts[6]?.trim() || '';

        return {
          id,
          content: `${headline} | ${subheadline} | CTA: ${cta}`,
          metric: conversionRate,
          date,
          meta: { headline, subheadline, cta, visitors },
        };
      });
  }

  /**
   * Write an improved copy template
   */
  async update({ content }: { content: string }) {
    await fs.writeFile(path.join(this.dataDir, 'prompt.md'), content, 'utf-8');
    return { updated: true, length: content.length };
  }

  // ── Manual Operations ──────────────────────────────────

  /**
   * Log a landing page variant and its conversion rate
   *
   * @param id Variant identifier {@example variant-a}
   * @param headline The headline text
   * @param subheadline The subheadline text
   * @param cta Call-to-action button text
   * @param conversionRate Conversion rate as percentage {@example 3.2}
   * @param visitors Number of visitors {@example 10000}
   */
  async add({ id, headline, subheadline, cta, conversionRate, visitors }: {
    id: string;
    headline: string;
    subheadline: string;
    cta: string;
    conversionRate: number;
    visitors: number;
  }) {
    const date = new Date().toISOString().split('T')[0];
    const line = `${id},"${headline}","${subheadline}","${cta}",${conversionRate},${visitors},${date}\n`;
    await fs.appendFile(path.join(this.dataDir, 'metrics.csv'), line, 'utf-8');
    return { added: id, conversionRate, visitors, date };
  }

  /**
   * View all tracked variants
   * @format table
   * @readOnly
   */
  async variants() {
    const data = await this.pull();
    return data.map((d: any) => ({
      id: d.id,
      headline: d.meta.headline,
      cta: d.meta.cta,
      conversion: `${d.metric}%`,
      visitors: d.meta.visitors,
      date: d.date,
    }));
  }

  /**
   * Generate landing page copy variants using the current template
   *
   * @param product What the product/service does
   * @param audience Who the target audience is
   * @format markdown
   */
  async generate({ product, audience }: { product: string; audience: string }) {
    const prompt = await this.prompt();
    return `## Generate Landing Page Copy\n\nUsing this optimized template:\n\n---\n${prompt}\n---\n\n**Product:** ${product}\n**Audience:** ${audience}\n\nGenerate 3 headline + subheadline + CTA variants following the template.`;
  }
}

const DEFAULT_PROMPT = `# Landing Page Copy Template

## Headline (under 10 words)
- Lead with the outcome, not the product
- Use the reader's language, not industry jargon
- Be specific: "Cut deploy time from 4 hours to 12 minutes"

## Subheadline (1–2 sentences)
- Explain HOW the outcome is achieved
- Reference social proof if available
- Address the biggest objection preemptively

## CTA Button (2–5 words)
- Start with a verb
- Echo the benefit: "Start Shipping Faster" not "Sign Up"
- One CTA only — no competing actions

## Anti-Patterns
- "The #1 Platform for X" — unverifiable
- "Revolutionary AI-powered solution" — jargon
- "Get Started" — says nothing about value
- Multiple CTAs fighting for attention
`;
