/**
 * Slides — AI-Native Presentation Tool
 *
 * Each instance is a deck: `_use('quarterly-review')` → `quarterly-review.md`.
 * Pass a full path to open any markdown file: `_use('/path/to/deck.md')`.
 *
 * ## UI Promises
 *
 * - Filmstrip sidebar with slide thumbnails — click to select
 * - Drag thumbnails to reorder slides (calls `move()`)
 * - Main slide preview scales to fill available space, including fullscreen
 * - Markdown editor for the selected slide with live preview
 * - Speaker notes editor tab below the markdown editor
 * - Theme selector dropdown: default, gaia, uncover (updates Marp frontmatter)
 * - Toolbar: Add Slide, Delete, Duplicate, Fullscreen Present
 * - Deck picker overlay: browse existing decks, create new ones, search
 * - Per-slide editing via `edit()` — not full-document save
 * - Keyboard shortcuts: arrow keys navigate, Escape exits fullscreen
 *
 * @version 1.0.0
 * @runtime ^1.14.0
 * @dependencies @marp-team/marp-core@^4.3.0
 * @tags presentation, slides, markdown, marp, ai-control
 * @icon 📽️
 * @stateful
 * @ui slides
 */
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

const DEFAULT_DECK = `---
marp: true
theme: photon-light
paginate: true
---

<!-- _class: lead -->

# Photon Slides
### AI-Native Presentation Tool

---

## How It Works

- **AI generates** Marp Markdown
- **Photon renders** high-fidelity CSS/HTML
- **UI syncs** the view in real-time

---

## Get Started

Ask AI to:
- "Add a slide about our Q3 results"
- "Change the theme to dark"
- "Use a two-column layout"
`;

let Marp: any;

// ── Design Token System ──────────────────────────────────────────────────

const TOKEN_BASE = `
  /* Typography */
  --font-heading: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --font-body: 'Inter', 'SF Pro Text', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
  --font-size-h1: 2.4em;
  --font-size-h2: 1.6em;
  --font-size-h3: 1.2em;
  --font-size-body: 1em;

  /* Spacing */
  --slide-padding: 60px;
  --gap-sm: 0.5rem;
  --gap-md: 1.5rem;
  --gap-lg: 3rem;

  /* Radius */
  --radius: 8px;
`;

const TOKEN_LIGHT = `
  --color-bg: #ffffff;
  --color-fg: #1a1a2e;
  --color-muted: #6b7280;
  --color-accent: #2563eb;
  --color-accent-soft: rgba(37, 99, 235, 0.08);
  --color-surface: #f8fafc;
  --color-border: #e2e8f0;
  --color-code-bg: #f1f5f9;
  --color-quote-border: #2563eb;
`;

const TOKEN_DARK = `
  --color-bg: #0f172a;
  --color-fg: #e2e8f0;
  --color-muted: #94a3b8;
  --color-accent: #60a5fa;
  --color-accent-soft: rgba(96, 165, 250, 0.1);
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-code-bg: #1e293b;
  --color-quote-border: #60a5fa;
`;

// ── Layout Classes (shared across all themes) ────────────────────────────

const LAYOUT_CSS = `
  /* ── Lead: centered title ── */
  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  section.lead h1 { font-size: var(--font-size-h1); }
  section.lead h3 { color: var(--color-muted); font-weight: 400; }

  /* ── Columns: 2-column grid ── */
  section.cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 var(--gap-lg);
    align-items: start;
  }
  section.cols-2 > h1, section.cols-2 > h2 {
    grid-column: 1 / -1;
  }

  /* ── Columns: 3-column grid ── */
  section.cols-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 var(--gap-md);
    align-items: start;
  }
  section.cols-3 > h1, section.cols-3 > h2 {
    grid-column: 1 / -1;
  }

  /* ── Image left/right ── */
  section.img-left {
    display: grid;
    grid-template-columns: 40% 1fr;
    gap: 0;
    padding: 0;
  }
  section.img-left img:first-of-type {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  section.img-left > :not(img:first-of-type) {
    padding: var(--slide-padding);
  }

  section.img-right {
    display: grid;
    grid-template-columns: 1fr 40%;
    gap: 0;
    padding: 0;
  }
  section.img-right img:last-of-type {
    width: 100%;
    height: 100%;
    object-fit: cover;
    grid-column: 2;
    grid-row: 1 / -1;
  }

  /* ── Quote: large centered quote ── */
  section.quote-big {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--slide-padding) calc(var(--slide-padding) * 2);
  }
  section.quote-big blockquote {
    border-left: 4px solid var(--color-quote-border);
    padding-left: var(--gap-md);
    font-size: 1.4em;
    font-style: italic;
    color: var(--color-fg);
  }
  section.quote-big blockquote + p {
    text-align: right;
    color: var(--color-muted);
  }

  /* ── Invert: swap fg/bg ── */
  section.invert {
    background: var(--color-fg);
    color: var(--color-bg);
  }

  /* ── Accent: accent-colored background ── */
  section.accent {
    background: var(--color-accent);
    color: white;
  }
  section.accent h1, section.accent h2, section.accent h3 {
    color: white;
  }
`;

// ── Base section styles (shared) ─────────────────────────────────────────

const SECTION_BASE = `
  section {
    font-family: var(--font-body);
    font-size: var(--font-size-body);
    background: var(--color-bg);
    color: var(--color-fg);
    padding: var(--slide-padding);
    line-height: 1.6;
  }
  section h1, section h2, section h3 { font-family: var(--font-heading); }
  section h1 { font-size: var(--font-size-h1); color: var(--color-fg); }
  section h2 { font-size: var(--font-size-h2); color: var(--color-fg); }
  section h3 { font-size: var(--font-size-h3); color: var(--color-muted); }
  section code {
    font-family: var(--font-mono);
    background: var(--color-code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
  }
  section pre {
    background: var(--color-code-bg);
    padding: 16px 20px;
    border-radius: var(--radius);
    overflow-x: auto;
  }
  section pre code { background: none; padding: 0; }
  section blockquote {
    border-left: 3px solid var(--color-border);
    padding-left: var(--gap-md);
    color: var(--color-muted);
  }
  section a { color: var(--color-accent); }
  section table { border-collapse: collapse; width: 100%; }
  section th, section td { border: 1px solid var(--color-border); padding: 8px 12px; text-align: left; }
  section th { background: var(--color-surface); font-weight: 600; }
  section img { border-radius: var(--radius); }
`;

// ── Theme Definitions ────────────────────────────────────────────────────

const PHOTON_THEMES: string[] = [
  // Light theme
  `/* @theme photon-light */
  section { ${TOKEN_BASE} ${TOKEN_LIGHT} }
  ${SECTION_BASE}
  ${LAYOUT_CSS}`,

  // Dark theme
  `/* @theme photon-dark */
  section { ${TOKEN_BASE} ${TOKEN_DARK} }
  ${SECTION_BASE}
  ${LAYOUT_CSS}
  section { background: var(--color-bg); color: var(--color-fg); }`,
];

export default class Slides {
  protected settings = {
    /** @property Directory where slide markdown files are stored */
    folder: path.join(os.homedir(), 'Documents', 'slides'),
  };

  declare memory: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
  };
  declare emit: (payload: { event: string; data: unknown }) => void;
  declare instanceName: string;

  private marp: any;

  // ── File Resolution (same pattern as Spreadsheet) ───────────────────────

  private get defaultFolder(): string {
    return this.settings?.folder || path.join(os.homedir(), 'Documents', 'slides');
  }

  private get deckPath(): string {
    const name = this.instanceName || 'slides';
    if (path.isAbsolute(name)) return name.endsWith('.md') ? name : name + '.md';
    if (name.includes('/') || name.includes('\\')) {
      const resolved = path.resolve(name);
      return resolved.endsWith('.md') ? resolved : resolved + '.md';
    }
    const dir = this.defaultFolder;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return path.join(dir, name.endsWith('.md') ? name : name + '.md');
  }

  async onInitialize() {
    const marpId = '@marp-team/marp-core';
    const marpModule = await import(/* webpackIgnore: true */ marpId);
    Marp = marpModule.Marp || marpModule.default;
    this.marp = new Marp({ container: false, inlineSVG: true, html: true });

    // Register Photon themes with layout classes and design tokens
    for (const theme of PHOTON_THEMES) {
      this.marp.themeSet.add(theme);
    }

    // Ensure folder exists
    const dir = this.defaultFolder;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Create default deck if this is the default instance and file doesn't exist
    if (!existsSync(this.deckPath)) {
      await fs.writeFile(this.deckPath, DEFAULT_DECK, 'utf8');
    }

    // Initialize slide position if not stored
    const state = await this.memory.get<any>('state');
    if (!state) {
      await this.memory.set('state', { currentSlide: 0 });
    }
  }

  // ── Presentation ────────────────────────────────────────────────────────

  /**
   * Open the presentation UI
   * @ui slides
   * @autorun
   */
  async main() {
    const markdown = await this.readDeck();
    const state = await this.getState();
    return this.renderResult(markdown, state.currentSlide);
  }

  /**
   * Move to the next slide
   * @ui slides
   */
  async next() {
    const markdown = await this.readDeck();
    const total = this.countSlides(markdown);
    const state = await this.getState();
    if (state.currentSlide < total - 1) {
      state.currentSlide++;
      await this.memory.set('state', state);
    }
    this.emit({ event: 'slideChanged', data: { type: 'nav', index: state.currentSlide } });
    return { type: 'nav', index: state.currentSlide, isEnd: state.currentSlide === total - 1 };
  }

  /**
   * Move to the previous slide
   * @ui slides
   */
  async previous() {
    const state = await this.getState();
    if (state.currentSlide > 0) {
      state.currentSlide--;
      await this.memory.set('state', state);
    }
    this.emit({ event: 'slideChanged', data: { type: 'nav', index: state.currentSlide } });
    return { type: 'nav', index: state.currentSlide, isStart: state.currentSlide === 0 };
  }

  /**
   * Jump to a specific slide
   * @param index 0-based slide index
   * @ui slides
   */
  async go({ index }: { index: number }) {
    const markdown = await this.readDeck();
    const total = this.countSlides(markdown);
    const state = await this.getState();
    state.currentSlide = clamp(Math.trunc(index), 0, Math.max(total - 1, 0));
    await this.memory.set('state', state);
    this.emit({ event: 'slideChanged', data: { type: 'nav', index: state.currentSlide } });
    return { type: 'nav', index: state.currentSlide };
  }

  // ── Deck Management ─────────────────────────────────────────────────────

  /**
   * List saved decks in the slides folder
   * @readOnly
   */
  async list() {
    const dir = this.defaultFolder;
    if (!existsSync(dir)) return { folder: dir, decks: [] };
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const decks = await Promise.all(
      entries
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map(async (e) => {
          const stat = await fs.stat(path.join(dir, e.name));
          const md = await fs.readFile(path.join(dir, e.name), 'utf8');
          return {
            file: e.name,
            title: firstHeading(md) || e.name.replace(/\.md$/i, ''),
            updatedAt: stat.mtime.toISOString(),
          };
        })
    );
    return { folder: dir, decks: decks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
  }

  /**
   * Read the current deck's markdown
   * @readOnly
   */
  async read() {
    return { file: path.basename(this.deckPath), markdown: await this.readDeck() };
  }

  /**
   * Save markdown to the current deck
   * @param markdown Full Marp markdown content
   * @ui slides
   */
  async save({ markdown }: { markdown: string }) {
    await fs.writeFile(this.deckPath, markdown, 'utf8');
    const state = await this.getState();
    const result = this.renderResult(markdown, state.currentSlide);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  /**
   * Update the full markdown and re-render
   * @param markdown New Marp markdown content
   * @ui slides
   */
  async update({ markdown }: { markdown: string }) {
    return this.save({ markdown });
  }

  // ── Slide-Level Operations ──────────────────────────────────────────────

  /**
   * Insert a new slide at a position
   * @param markdown Slide content
   * @param index Position to insert (appends if omitted)
   * @ui slides
   */
  async add(params?: { markdown?: string; index?: number }) {
    const md = await this.readDeck();
    const { frontmatter, slides } = splitMarpMarkdown(md);
    const content = params?.markdown ?? '';
    const index =
      params?.index != null ? clamp(Math.trunc(params.index), 0, slides.length) : slides.length;
    slides.splice(index, 0, content);
    const newMd = joinMarpMarkdown(frontmatter, slides);
    await fs.writeFile(this.deckPath, newMd, 'utf8');
    await this.memory.set('state', { currentSlide: index });
    const result = this.renderResult(newMd, index);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  /**
   * Replace a slide's content
   * @param index Slide index
   * @param markdown New content
   * @ui slides
   */
  async edit({ index, markdown }: { index: number; markdown: string }) {
    const md = await this.readDeck();
    const { frontmatter, slides } = splitMarpMarkdown(md);
    const i = clamp(Math.trunc(index), 0, Math.max(slides.length - 1, 0));
    slides[i] = markdown;
    const newMd = joinMarpMarkdown(frontmatter, slides);
    await fs.writeFile(this.deckPath, newMd, 'utf8');
    const result = this.renderResult(newMd, i);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  /**
   * Reorder a slide
   * @param from Source index
   * @param to Target index
   * @ui slides
   */
  async move({ from, to }: { from: number; to: number }) {
    const md = await this.readDeck();
    const { frontmatter, slides } = splitMarpMarkdown(md);
    const f = clamp(Math.trunc(from), 0, Math.max(slides.length - 1, 0));
    const t = clamp(Math.trunc(to), 0, Math.max(slides.length - 1, 0));
    if (f === t) return this.renderResult(md, f);
    const [slide] = slides.splice(f, 1);
    slides.splice(t, 0, slide);
    const newMd = joinMarpMarkdown(frontmatter, slides);
    await fs.writeFile(this.deckPath, newMd, 'utf8');
    await this.memory.set('state', { currentSlide: t });
    const result = this.renderResult(newMd, t);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  /**
   * Delete a slide
   * @param index Slide index
   * @destructive
   * @ui slides
   */
  async remove({ index }: { index: number }) {
    const md = await this.readDeck();
    const { frontmatter, slides } = splitMarpMarkdown(md);
    if (slides.length <= 1) return { error: 'Cannot remove the last slide' };
    const i = clamp(Math.trunc(index), 0, Math.max(slides.length - 1, 0));
    slides.splice(i, 1);
    const newMd = joinMarpMarkdown(frontmatter, slides);
    await fs.writeFile(this.deckPath, newMd, 'utf8');
    const cur = clamp(i, 0, Math.max(slides.length - 1, 0));
    await this.memory.set('state', { currentSlide: cur });
    const result = this.renderResult(newMd, cur);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  /**
   * Duplicate a slide
   * @param index Slide index to copy
   * @ui slides
   */
  async duplicate({ index }: { index: number }) {
    const md = await this.readDeck();
    const { frontmatter, slides } = splitMarpMarkdown(md);
    const i = clamp(Math.trunc(index), 0, Math.max(slides.length - 1, 0));
    slides.splice(i + 1, 0, slides[i]);
    const newMd = joinMarpMarkdown(frontmatter, slides);
    await fs.writeFile(this.deckPath, newMd, 'utf8');
    await this.memory.set('state', { currentSlide: i + 1 });
    const result = this.renderResult(newMd, i + 1);
    this.emit({ event: 'deckChanged', data: result });
    return result;
  }

  // ── Context ─────────────────────────────────────────────────────────────

  /**
   * Current presentation state for AI context
   * @readOnly
   */
  async status() {
    const md = await this.readDeck();
    const { slides } = splitMarpMarkdown(md);
    const state = await this.getState();
    return {
      file: path.basename(this.deckPath),
      currentSlide: state.currentSlide,
      totalSlides: slides.length,
      currentContent: slides[state.currentSlide],
      nextSlidePreview: slides[state.currentSlide + 1] || null,
      markdown: md,
    };
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private async readDeck(): Promise<string> {
    try {
      return await fs.readFile(this.deckPath, 'utf8');
    } catch {
      return DEFAULT_DECK;
    }
  }

  private async getState() {
    return (await this.memory.get<any>('state')) || { currentSlide: 0 };
  }

  private renderResult(markdown: string, currentSlide: number) {
    const { html, css } = this.marp.render(markdown);
    const total = (html.match(/<section/g) || []).length;
    return {
      type: 'render',
      html,
      css,
      total,
      current: clamp(currentSlide, 0, Math.max(total - 1, 0)),
      markdown,
    };
  }

  private countSlides(markdown: string): number {
    const { html } = this.marp.render(markdown);
    return (html.match(/<section/g) || []).length;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(v) ? v : min, min), max);
}

function firstHeading(md: string) {
  return md.match(/^#\s+(.+)$/m)?.[1]?.trim() || '';
}

function splitMarpMarkdown(markdown: string) {
  const fm = markdown.match(/^---\n[\s\S]*?\n---\n*/);
  const frontmatter = fm ? fm[0].trimEnd() : '---\nmarp: true\n---';
  const body = fm ? markdown.slice(fm[0].length) : markdown;
  const slides: string[] = [];
  let cur: string[] = [];
  for (const line of body.split('\n')) {
    if (line.trim() === '---') {
      slides.push(cur.join('\n').trim());
      cur = [];
      continue;
    }
    cur.push(line);
  }
  slides.push(cur.join('\n').trim());
  return { frontmatter, slides: slides.filter((s) => s.length > 0) };
}

function joinMarpMarkdown(frontmatter: string, slides: string[]): string {
  return `${frontmatter}\n\n${slides.join('\n\n---\n\n')}\n`;
}
