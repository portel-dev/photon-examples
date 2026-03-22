/**
 * Social Hooks — AutoResearch target for video/social media hooks
 *
 * Implements the AutoResearch interface so autorun can optimize
 * your video hooks based on real view counts. Stores the prompt
 * template as a markdown file and pulls metrics from a CSV log.
 *
 * Feed your view counts into the CSV and let the loop optimize
 * which hook patterns get the most views.
 *
 * @version 1.0.0
 * @stateful
 * @icon 🎬
 * @tags auto-research, social-media, hooks, content
 */

import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'social-hooks');

export default class SocialHooks {
  private dataDir = DATA_DIR;

  async onInitialize() {
    if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true });

    const promptPath = path.join(this.dataDir, 'prompt.md');
    if (!existsSync(promptPath)) {
      await fs.writeFile(promptPath, DEFAULT_PROMPT, 'utf-8');
    }

    const csvPath = path.join(this.dataDir, 'metrics.csv');
    if (!existsSync(csvPath)) {
      await fs.writeFile(csvPath, 'id,content,views,date\n', 'utf-8');
    }
  }

  // ── AutoResearch Interface ─────────────────────────────

  /**
   * Returns the current hook prompt template
   * @readOnly
   */
  async prompt() {
    return await fs.readFile(path.join(this.dataDir, 'prompt.md'), 'utf-8');
  }

  /**
   * Binary eval criteria for hook quality — no vibes, only yes/no
   * @readOnly
   */
  criteria() {
    return [
      { label: 'result-hook', question: 'Does the hook describe a result or transformation, not just a feature?' },
      { label: 'stop-scroll', question: 'Would the first frame make someone stop scrolling?' },
      { label: 'not-pr', question: 'Does the script avoid sounding like a press release or changelog?' },
      { label: 'person-story', question: 'Does the hook feature a person or story, not just a company or product?' },
      { label: 'curiosity-gap', question: 'Does it create a curiosity gap that can only be closed by watching?' },
      { label: 'specific-number', question: 'Does it include a specific number, timeframe, or concrete detail?' },
      { label: 'emotional-word', question: 'Does the first sentence contain an emotionally charged word?' },
      { label: 'under-15-words', question: 'Is the hook under 15 words?' },
      { label: 'visual-hook', question: 'Does it suggest a strong visual that could be shown in the first frame?' },
      { label: 'universal-appeal', question: 'Would this interest someone outside the niche?' },
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
        const [id, ...rest] = line.split(',');
        const date = rest.pop()!.trim();
        const views = parseInt(rest.pop()!.trim(), 10);
        const content = rest.join(',').trim();
        return { id: id.trim(), content, metric: views || 0, date };
      });
  }

  /**
   * Write an improved prompt template
   */
  async update({ content }: { content: string }) {
    await fs.writeFile(path.join(this.dataDir, 'prompt.md'), content, 'utf-8');
    return { updated: true, length: content.length };
  }

  // ── Manual Operations ──────────────────────────────────

  /**
   * Add a video and its view count to the metrics log
   *
   * @param id Unique video identifier {@example v42}
   * @param content The hook text used
   * @param views View count
   */
  async add({ id, content, views }: { id: string; content: string; views: number }) {
    const date = new Date().toISOString().split('T')[0];
    const line = `${id},"${content.replace(/"/g, '""')}",${views},${date}\n`;
    await fs.appendFile(path.join(this.dataDir, 'metrics.csv'), line, 'utf-8');
    return { added: id, views, date };
  }

  /**
   * View all tracked videos and their metrics
   * @format table
   * @readOnly
   */
  async videos() {
    return await this.pull();
  }

  /**
   * Generate a hook using the current prompt template
   *
   * Returns the prompt so the calling LLM can generate the hook.
   *
   * @param topic What the video is about {@example AI automating content creation}
   * @format markdown
   */
  async generate({ topic }: { topic: string }) {
    const prompt = await this.prompt();
    return `## Generate a Hook\n\nUsing this optimized template:\n\n---\n${prompt}\n---\n\n**Topic:** ${topic}\n\nWrite a hook following the template above.`;
  }
}

const DEFAULT_PROMPT = `# Video Hook Template

## Structure
1. **Hook** (under 15 words): Lead with a result or transformation
2. **Tension**: Create a curiosity gap
3. **Promise**: What the viewer will learn/gain

## Rules
- Describe results, not features
- Use a person or story, not a company
- Include a specific number or timeframe
- First sentence must have an emotionally charged word
- Must suggest a strong visual for the first frame
- Never sound like a press release

## Examples
- "I automated my entire content pipeline — it runs 24/7 without me"
- "This robot learned backflips by watching YouTube fails"
- "3 lines of code replaced my $2,000/month marketing tool"
`;
