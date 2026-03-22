/**
 * AutoLoop — Self-Improving Optimization Loop
 *
 * Applies Karpathy's auto-research pattern to anything with a measurable output.
 * Give it a file to optimize, binary eval criteria, and a way to measure results.
 * It pulls real data, scores outputs, finds what works, rewrites the file, and logs every change.
 *
 * Each instance (`_use`) is a separate optimization target:
 *   `_use('video-hooks')` — optimize video script hooks
 *   `_use('email-subject')` — optimize email subject lines
 *   `_use('landing-cta')` — optimize landing page CTAs
 *
 * @version 1.0.0
 * @stateful
 * @icon 🔄
 * @tags optimization, auto-research, self-improvement, eval
 */

import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

interface EvalCriterion {
  /** Binary yes/no question — no vibes, no scales */
  question: string;
  /** Short label for reports */
  label: string;
}

interface DataPoint {
  /** Unique identifier for this output */
  id: string;
  /** The output content that was produced */
  content: string;
  /** Real-world performance metric (views, clicks, conversions, etc.) */
  metric: number;
  /** When this was produced */
  date: string;
  /** Optional metadata */
  meta?: Record<string, any>;
}

interface EvalResult {
  id: string;
  scores: Record<string, boolean>;
  total: number;
  maxScore: number;
}

interface LoopEntry {
  /** Loop iteration number */
  iteration: number;
  /** When this loop ran */
  timestamp: string;
  /** Number of data points analyzed */
  dataPoints: number;
  /** Winners found (high eval + high metric) */
  winners: number;
  /** Losers found (low eval or low metric) */
  losers: number;
  /** False positives (high eval + low metric — eval needs fixing) */
  falsePositives: number;
  /** Changes made to the target file */
  changes: string;
  /** Snapshot of the file before changes */
  previousVersion: string;
  /** Snapshot of the file after changes */
  newVersion: string;
}

// ── State ────────────────────────────────────────────────────

interface LoopState {
  /** Path to the file being optimized */
  targetFile: string;
  /** What to optimize for — plain English instructions */
  instructions: string;
  /** Binary eval criteria — yes/no questions only */
  criteria: EvalCriterion[];
  /** Label for the performance metric (e.g., "views", "clicks", "conversions") */
  metricLabel: string;
  /** All data points collected */
  data: DataPoint[];
  /** Eval results keyed by data point id */
  evals: Record<string, EvalResult>;
  /** Research log — every loop iteration */
  log: LoopEntry[];
  /** Current iteration */
  iteration: number;
}

const DEFAULT_STATE: LoopState = {
  targetFile: '',
  instructions: '',
  criteria: [],
  metricLabel: 'views',
  data: [],
  evals: {},
  log: [],
  iteration: 0,
};

export default class AutoLoop {
  private state: LoopState = { ...DEFAULT_STATE, data: [], evals: {}, log: [], criteria: [] };

  // ── Setup ────────────────────────────────────────────────

  /**
   * Configure what to optimize
   *
   * @param target Path to the file to improve (prompt, template, config)
   * @param instructions What to optimize for — plain English
   * @param metric Label for the real-world metric {@example views}
   */
  async init({ target, instructions, metric }: {
    target: string;
    instructions: string;
    metric: string;
  }) {
    const resolved = path.resolve(target);
    if (!existsSync(resolved)) throw new Error(`File not found: ${resolved}`);

    this.state.targetFile = resolved;
    this.state.instructions = instructions;
    this.state.metricLabel = metric || 'views';

    const content = await fs.readFile(resolved, 'utf-8');
    return {
      target: resolved,
      instructions,
      metric: this.state.metricLabel,
      filePreview: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
      criteriaCount: this.state.criteria.length,
      hint: this.state.criteria.length === 0
        ? 'Next: add binary eval criteria with `criteria`'
        : `Ready with ${this.state.criteria.length} eval criteria`,
    };
  }

  /**
   * Set binary eval criteria — yes/no questions only, no vibes
   *
   * Each criterion must be a clear yes/no question that an LLM can answer
   * without subjectivity. "Is this engaging?" is bad. "Does the hook
   * describe a result or transformation, not just a feature?" is good.
   *
   * @param criteria Array of { question, label } objects
   */
  criteria({ criteria }: { criteria: EvalCriterion[] }) {
    for (const c of criteria) {
      if (!c.question || !c.label) {
        throw new Error('Each criterion needs both "question" and "label"');
      }
    }
    this.state.criteria = criteria;
    return {
      count: criteria.length,
      criteria: criteria.map(c => `[${c.label}] ${c.question}`),
    };
  }

  // ── Data ─────────────────────────────────────────────────

  /**
   * Feed performance data — real-world metrics for past outputs
   *
   * Each data point is an output that was produced and its real performance.
   * The loop learns from what worked and what didn't.
   *
   * @param points Array of { id, content, metric, date, meta? }
   */
  feed({ points }: { points: DataPoint[] }) {
    for (const p of points) {
      const existing = this.state.data.findIndex(d => d.id === p.id);
      if (existing >= 0) {
        this.state.data[existing] = p;
      } else {
        this.state.data.push(p);
      }
    }
    return {
      added: points.length,
      total: this.state.data.length,
      metricRange: this.state.data.length > 0
        ? {
            min: Math.min(...this.state.data.map(d => d.metric)),
            max: Math.max(...this.state.data.map(d => d.metric)),
            avg: Math.round(this.state.data.reduce((s, d) => s + d.metric, 0) / this.state.data.length),
          }
        : null,
    };
  }

  // ── Eval ─────────────────────────────────────────────────

  /**
   * Score a single output against all binary criteria
   *
   * Returns the score breakdown. In production, an LLM answers each
   * yes/no question. Here you provide the answers directly so the
   * loop stays model-agnostic.
   *
   * @param id Data point ID to score
   * @param answers Object mapping criterion labels to true/false
   */
  score({ id, answers }: { id: string; answers: Record<string, boolean> }) {
    const point = this.state.data.find(d => d.id === id);
    if (!point) throw new Error(`Data point "${id}" not found. Feed it first.`);

    const scores: Record<string, boolean> = {};
    let total = 0;
    for (const c of this.state.criteria) {
      const val = answers[c.label] ?? false;
      scores[c.label] = val;
      if (val) total++;
    }

    const result: EvalResult = {
      id,
      scores,
      total,
      maxScore: this.state.criteria.length,
    };
    this.state.evals[id] = result;

    return {
      id,
      score: `${total}/${this.state.criteria.length}`,
      metric: point.metric,
      breakdown: Object.entries(scores).map(([label, pass]) =>
        `${pass ? '✓' : '✗'} ${label}`
      ),
    };
  }

  /**
   * Batch-score multiple outputs at once
   *
   * @param scores Array of { id, answers } objects
   * @format table
   */
  batch({ scores }: { scores: Array<{ id: string; answers: Record<string, boolean> }> }) {
    return scores.map(s => this.score(s));
  }

  // ── Analysis ─────────────────────────────────────────────

  /**
   * Analyze what's working — correlate eval scores with real performance
   *
   * Finds winners (high eval + high metric), losers, and false positives
   * (high eval + low metric, meaning the eval criteria need fixing).
   *
   * @format markdown
   * @readOnly
   */
  analyze() {
    if (this.state.data.length === 0) throw new Error('No data. Feed data points first.');
    if (Object.keys(this.state.evals).length === 0) throw new Error('No evals. Score outputs first.');

    const evaluated = this.state.data
      .filter(d => this.state.evals[d.id])
      .map(d => ({
        ...d,
        eval: this.state.evals[d.id],
        evalPct: this.state.evals[d.id].total / this.state.evals[d.id].maxScore,
      }));

    if (evaluated.length === 0) throw new Error('No scored data points.');

    const avgMetric = evaluated.reduce((s, d) => s + d.metric, 0) / evaluated.length;
    const highEvalThreshold = 0.7;

    const winners = evaluated.filter(d => d.evalPct >= highEvalThreshold && d.metric >= avgMetric);
    const losers = evaluated.filter(d => d.evalPct < highEvalThreshold && d.metric < avgMetric);
    const falsePositives = evaluated.filter(d => d.evalPct >= highEvalThreshold && d.metric < avgMetric);
    const sleepers = evaluated.filter(d => d.evalPct < highEvalThreshold && d.metric >= avgMetric);

    const criteriaAccuracy: Record<string, { correct: number; total: number }> = {};
    for (const c of this.state.criteria) {
      let correct = 0;
      let total = 0;
      for (const d of evaluated) {
        const passed = d.eval.scores[c.label];
        const isHighPerf = d.metric >= avgMetric;
        if ((passed && isHighPerf) || (!passed && !isHighPerf)) correct++;
        total++;
      }
      criteriaAccuracy[c.label] = { correct, total };
    }

    let report = `# Analysis — Iteration ${this.state.iteration}\n\n`;
    report += `**${evaluated.length}** outputs scored, avg ${this.state.metricLabel}: **${Math.round(avgMetric)}**\n\n`;
    report += `| Category | Count | Meaning |\n|---|---|---|\n`;
    report += `| 🏆 Winners | ${winners.length} | High eval + high ${this.state.metricLabel} |\n`;
    report += `| 📉 Losers | ${losers.length} | Low eval + low ${this.state.metricLabel} |\n`;
    report += `| ⚠️ False Positives | ${falsePositives.length} | High eval but low ${this.state.metricLabel} — fix eval |\n`;
    report += `| 💤 Sleepers | ${sleepers.length} | Low eval but high ${this.state.metricLabel} — eval misses this |\n\n`;

    if (winners.length > 0) {
      report += `## Winners\n`;
      for (const w of winners.slice(0, 5)) {
        report += `- **${w.id}** — ${w.metric} ${this.state.metricLabel}, score ${w.eval.total}/${w.eval.maxScore}\n`;
      }
      report += '\n';
    }

    if (falsePositives.length > 0) {
      report += `## ⚠️ Eval Needs Fixing\n`;
      report += `These scored high but performed poorly. The eval criteria may be wrong:\n`;
      for (const fp of falsePositives.slice(0, 5)) {
        report += `- **${fp.id}** — ${fp.metric} ${this.state.metricLabel}, score ${fp.eval.total}/${fp.eval.maxScore}\n`;
      }
      report += '\n';
    }

    report += `## Criteria Accuracy\n`;
    report += `| Criterion | Accuracy |\n|---|---|\n`;
    for (const [label, acc] of Object.entries(criteriaAccuracy)) {
      const pct = Math.round((acc.correct / acc.total) * 100);
      report += `| ${label} | ${pct}% (${acc.correct}/${acc.total}) |\n`;
    }

    return report;
  }

  // ── Improve ──────────────────────────────────────────────

  /**
   * Generate an improved version of the target file
   *
   * Based on the analysis, provides a diff of recommended changes.
   * The changes are NOT applied automatically — review first with `apply`.
   *
   * @param changes Description of what to change and why
   */
  async improve({ changes }: { changes: string }) {
    if (!this.state.targetFile) throw new Error('No target file. Run `init` first.');

    const current = await fs.readFile(this.state.targetFile, 'utf-8');

    this.state.iteration++;
    const entry: LoopEntry = {
      iteration: this.state.iteration,
      timestamp: new Date().toISOString(),
      dataPoints: this.state.data.length,
      winners: 0,
      losers: 0,
      falsePositives: 0,
      changes,
      previousVersion: current,
      newVersion: '', // filled after apply
    };
    this.state.log.push(entry);

    return {
      iteration: this.state.iteration,
      currentFile: this.state.targetFile,
      currentContent: current,
      proposedChanges: changes,
      instruction: 'Review the changes. Use `apply` with the new content to write it, or `reject` to discard.',
    };
  }

  /**
   * Apply the improved version to the target file
   *
   * @param content The new file content to write
   */
  async apply({ content }: { content: string }) {
    if (!this.state.targetFile) throw new Error('No target file.');
    if (this.state.log.length === 0) throw new Error('No pending improvement. Run `improve` first.');

    await fs.writeFile(this.state.targetFile, content, 'utf-8');

    const lastEntry = this.state.log[this.state.log.length - 1];
    lastEntry.newVersion = content;

    return {
      iteration: lastEntry.iteration,
      file: this.state.targetFile,
      written: true,
      timestamp: lastEntry.timestamp,
    };
  }

  /**
   * Reject the pending improvement
   */
  reject() {
    if (this.state.log.length === 0) throw new Error('No pending improvement.');
    const lastEntry = this.state.log[this.state.log.length - 1];
    lastEntry.newVersion = lastEntry.previousVersion;
    lastEntry.changes = `[REJECTED] ${lastEntry.changes}`;
    return { iteration: lastEntry.iteration, rejected: true };
  }

  // ── Research Log ─────────────────────────────────────────

  /**
   * View the research log — every iteration with its data and changes
   *
   * The research log is the most valuable asset. When a smarter model
   * comes out, hand it this log and it picks up exactly where you left off.
   *
   * @format table
   * @readOnly
   */
  log() {
    return this.state.log.map(entry => ({
      '#': entry.iteration,
      date: entry.timestamp.split('T')[0],
      data: entry.dataPoints,
      changes: entry.changes.slice(0, 100) + (entry.changes.length > 100 ? '...' : ''),
    }));
  }

  /**
   * View a specific iteration's full details
   *
   * @param iteration Iteration number to view
   * @format markdown
   * @readOnly
   */
  entry({ iteration }: { iteration: number }) {
    const entry = this.state.log.find(e => e.iteration === iteration);
    if (!entry) throw new Error(`Iteration ${iteration} not found.`);

    let md = `# Iteration ${entry.iteration}\n`;
    md += `**Date:** ${entry.timestamp}\n`;
    md += `**Data points:** ${entry.dataPoints}\n\n`;
    md += `## Changes\n${entry.changes}\n\n`;
    md += `## Previous Version\n\`\`\`\n${entry.previousVersion}\n\`\`\`\n\n`;
    md += `## New Version\n\`\`\`\n${entry.newVersion}\n\`\`\`\n`;
    return md;
  }

  /**
   * Export the full research log as JSON for handoff to a new model
   *
   * @readOnly
   */
  async export() {
    return {
      instance: this.state.targetFile,
      instructions: this.state.instructions,
      criteria: this.state.criteria,
      metricLabel: this.state.metricLabel,
      iterations: this.state.iteration,
      dataPoints: this.state.data.length,
      log: this.state.log,
    };
  }

  // ── Status ───────────────────────────────────────────────

  /**
   * Current state of the optimization loop
   *
   * @format kv
   * @readOnly
   */
  status() {
    return {
      target: this.state.targetFile || '(not set)',
      instructions: this.state.instructions || '(not set)',
      criteria: this.state.criteria.length,
      metric: this.state.metricLabel,
      dataPoints: this.state.data.length,
      scored: Object.keys(this.state.evals).length,
      iterations: this.state.iteration,
      lastRun: this.state.log.length > 0
        ? this.state.log[this.state.log.length - 1].timestamp
        : 'never',
    };
  }
}
