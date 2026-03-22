/**
 * Email Subject — AutoResearch target for email subject lines
 *
 * Implements the AutoResearch interface so autorun can optimize
 * your email subject lines based on real open rates. Stores
 * the template and pulls metrics from a CSV log.
 *
 * @version 1.0.0
 * @stateful
 * @icon 📧
 * @tags auto-research, email, subject-lines, marketing
 */

import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'email-subject');

export default class EmailSubject {
  private dataDir = DATA_DIR;

  async onInitialize() {
    if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true });

    const promptPath = path.join(this.dataDir, 'prompt.md');
    if (!existsSync(promptPath)) {
      await fs.writeFile(promptPath, DEFAULT_PROMPT, 'utf-8');
    }

    const csvPath = path.join(this.dataDir, 'metrics.csv');
    if (!existsSync(csvPath)) {
      await fs.writeFile(csvPath, 'id,subject,open_rate,sent,date\n', 'utf-8');
    }
  }

  // ── AutoResearch Interface ─────────────────────────────

  /**
   * Returns the current subject line template
   * @readOnly
   */
  async prompt() {
    return await fs.readFile(path.join(this.dataDir, 'prompt.md'), 'utf-8');
  }

  /**
   * Binary eval criteria for subject line quality
   * @readOnly
   */
  criteria() {
    return [
      { label: 'under-50-chars', question: 'Is the subject line under 50 characters?' },
      { label: 'no-spam-words', question: 'Does it avoid spam trigger words (free, act now, limited time, guaranteed)?' },
      { label: 'curiosity', question: 'Does it create curiosity without being clickbait?' },
      { label: 'specific', question: 'Does it include a specific detail (number, name, or concrete outcome)?' },
      { label: 'personal', question: 'Does it feel like it was written for one person, not a list?' },
      { label: 'no-all-caps', question: 'Does it avoid ALL CAPS and excessive punctuation (!!!)?' },
      { label: 'action-implied', question: 'Does it imply an action the reader can take or a benefit they will get?' },
      { label: 'preview-safe', question: 'Does the meaning survive truncation to 30 characters (mobile preview)?' },
    ];
  }

  /**
   * Pull performance data from the metrics CSV
   * @readOnly
   */
  async pull() {
    const csv = await fs.readFile(path.join(this.dataDir, 'metrics.csv'), 'utf-8');
    const lines = csv.trim().split('\n').slice(1);

    return lines
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^([^,]+),"?([^"]*)"?,([^,]+),([^,]+),(.+)$/);
        if (!match) return null;
        return {
          id: match[1].trim(),
          content: match[2].trim(),
          metric: parseFloat(match[3].trim()),
          date: match[5].trim(),
          meta: { sent: parseInt(match[4].trim(), 10) },
        };
      })
      .filter(Boolean);
  }

  /**
   * Write an improved subject line template
   */
  async update({ content }: { content: string }) {
    await fs.writeFile(path.join(this.dataDir, 'prompt.md'), content, 'utf-8');
    return { updated: true, length: content.length };
  }

  // ── Manual Operations ──────────────────────────────────

  /**
   * Log an email campaign's subject line and open rate
   *
   * @param id Campaign identifier {@example campaign-42}
   * @param subject The subject line used
   * @param openRate Open rate as percentage {@example 24.5}
   * @param sent Number of emails sent {@example 5000}
   */
  async add({ id, subject, openRate, sent }: {
    id: string;
    subject: string;
    openRate: number;
    sent: number;
  }) {
    const date = new Date().toISOString().split('T')[0];
    const line = `${id},"${subject.replace(/"/g, '""')}",${openRate},${sent},${date}\n`;
    await fs.appendFile(path.join(this.dataDir, 'metrics.csv'), line, 'utf-8');
    return { added: id, openRate, sent, date };
  }

  /**
   * View all tracked campaigns
   * @format table
   * @readOnly
   */
  async campaigns() {
    const data = await this.pull();
    return data.map((d: any) => ({
      id: d.id,
      subject: d.content,
      openRate: `${d.metric}%`,
      sent: d.meta?.sent || 0,
      date: d.date,
    }));
  }

  /**
   * Generate subject line variants using the current template
   *
   * @param topic Email topic/content summary
   * @param count How many variants to generate {@example 5}
   * @format markdown
   */
  async generate({ topic, count }: { topic: string; count?: number }) {
    const prompt = await this.prompt();
    return `## Generate ${count || 5} Subject Lines\n\nUsing this optimized template:\n\n---\n${prompt}\n---\n\n**Email topic:** ${topic}\n\nGenerate ${count || 5} subject line variants following the template above.`;
  }
}

const DEFAULT_PROMPT = `# Email Subject Line Template

## Rules
- Under 50 characters
- No spam trigger words
- Create curiosity without clickbait
- Include a specific detail (number, name, outcome)
- Write for one person, not a list
- No ALL CAPS or excessive punctuation
- Imply an action or benefit
- Meaning survives mobile preview truncation (30 chars)

## Patterns That Work
- Question that mirrors internal dialogue: "Still doing X manually?"
- Specific result: "We cut onboarding from 2 weeks to 3 days"
- Personal observation: "Noticed your team ships on Fridays"
- Contrarian: "Stop A/B testing your subject lines"

## Patterns That Fail
- Generic value prop: "Boost your productivity today"
- Hype: "AMAZING new feature you'll LOVE!!!"
- Vague: "Quick update" / "Newsletter #47"
`;
