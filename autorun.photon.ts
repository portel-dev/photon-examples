/**
 * AutoRun — Orchestrates self-improvement loops for any photon
 *
 * A meta-photon that automates the Karpathy auto-research pattern.
 * Point it at any photon that follows the AutoResearch interface,
 * and it runs the full loop: pull → eval → analyze → improve → log.
 *
 * Target photons must implement these methods:
 *   `prompt()`              → returns current prompt/template content
 *   `update({ content })`   → writes the improved version
 *   `pull()`                → returns performance data points
 *   `criteria()`            → returns binary eval criteria
 *
 * The calling LLM acts as the eval engine — the `run` generator yields
 * each output for scoring, then asks the LLM to analyze and improve.
 *
 * Usage:
 *   `_use('my-content')` — one instance per optimization target
 *   `autorun start --target content --interval daily`
 *
 * @version 1.0.0
 * @photon autoloop
 * @stateful
 * @icon ⚡
 * @tags automation, auto-research, optimization, meta
 */

interface RunConfig {
  /** Name of the target photon to optimize */
  target: string;
  /** Instance name of the target photon (optional) */
  instance?: string;
  /** Override: skip human approval and auto-apply improvements */
  autoApply?: boolean;
}

interface ScheduleConfig extends RunConfig {
  /** Cron expression or preset: @daily, @hourly, @weekly */
  interval: string;
}

interface RunState {
  target: string;
  instance?: string;
  lastRun?: string;
  totalRuns: number;
  scheduled: boolean;
  scheduleName?: string;
}

export default class AutoRun {
  private autoloop: any;
  private state: RunState = { target: '', totalRuns: 0, scheduled: false };

  /**
   * Run one full optimization cycle
   *
   * Orchestrates the complete loop as an interactive generator.
   * The calling LLM evaluates outputs and proposes improvements.
   * Pass target (photon name), instance (optional _use name),
   * and autoApply (skip human approval).
   */
  async *run({ target, instance, autoApply }: RunConfig) {
    this.state.target = target;
    this.state.instance = instance;

    // ── Step 1: Pull current prompt from target ──────────
    yield { emit: 'status', message: `Connecting to ${target}${instance ? `/${instance}` : ''}...` };

    let currentPrompt: string;
    try {
      const promptResult = await this.call(target, 'prompt', instance ? { _use: instance } : {});
      currentPrompt = typeof promptResult === 'string' ? promptResult : JSON.stringify(promptResult);
    } catch (e: any) {
      return { error: `Target "${target}" must implement a \`prompt()\` method. ${e.message}` };
    }

    yield { emit: 'status', message: `Got current prompt (${currentPrompt.length} chars)` };

    // ── Step 2: Pull criteria from target ────────────────
    let criteria: Array<{ question: string; label: string }>;
    try {
      const criteriaResult = await this.call(target, 'criteria', instance ? { _use: instance } : {});
      criteria = Array.isArray(criteriaResult) ? criteriaResult : criteriaResult?.criteria || [];
    } catch {
      return {
        error: `Target "${target}" must implement a \`criteria()\` method returning [{question, label}].`,
        hint: 'Each criterion is a binary yes/no question. No vibes, no scales.',
      };
    }

    if (criteria.length === 0) {
      return { error: 'No eval criteria returned. Target must return at least one {question, label}.' };
    }

    // Set criteria on autoloop
    this.autoloop.criteria({ criteria });
    yield { emit: 'status', message: `Loaded ${criteria.length} eval criteria` };

    // ── Step 3: Pull performance data from target ────────
    let dataPoints: Array<{ id: string; content: string; metric: number; date: string }>;
    try {
      const pullResult = await this.call(target, 'pull', instance ? { _use: instance } : {});
      dataPoints = Array.isArray(pullResult) ? pullResult : pullResult?.points || [];
    } catch (e: any) {
      return { error: `Target "${target}" must implement a \`pull()\` method. ${e.message}` };
    }

    if (dataPoints.length === 0) {
      return { error: 'No data points returned. Nothing to optimize yet.' };
    }

    this.autoloop.feed({ points: dataPoints });
    yield {
      emit: 'status',
      message: `Pulled ${dataPoints.length} data points (metric range: ${Math.min(...dataPoints.map(d => d.metric))} – ${Math.max(...dataPoints.map(d => d.metric))})`,
    };

    // ── Step 4: Ask LLM to eval each unscored output ────
    yield {
      emit: 'render',
      format: 'markdown',
      value: `## Eval Phase\n\nScore each output against ${criteria.length} binary criteria.\nAnswer each question with yes or no.\n\n**Criteria:**\n${criteria.map(c => `- **${c.label}**: ${c.question}`).join('\n')}`,
    };

    const scoringPrompt = {
      ask: 'eval',
      message: `Score these ${dataPoints.length} outputs. For each, answer the ${criteria.length} criteria with true/false.\n\nReturn JSON: [{id, answers: {label: true/false}}]\n\n` +
        dataPoints.map(d => `**${d.id}** (${d.metric} metric): "${d.content.slice(0, 200)}"`).join('\n\n') +
        `\n\nCriteria: ${criteria.map(c => `${c.label}: "${c.question}"`).join(', ')}`,
    };

    const evalResponse: any = yield scoringPrompt;

    // Parse LLM eval response
    if (evalResponse && Array.isArray(evalResponse)) {
      this.autoloop.batch({ scores: evalResponse });
      yield { emit: 'status', message: `Scored ${evalResponse.length} outputs` };
    } else if (evalResponse && typeof evalResponse === 'object') {
      // Handle case where LLM returns a single object with scores
      const scores = evalResponse.scores || [evalResponse];
      this.autoloop.batch({ scores });
      yield { emit: 'status', message: `Scored ${scores.length} outputs` };
    } else {
      return { error: 'Could not parse eval response. Expected [{id, answers: {label: true/false}}]' };
    }

    // ── Step 5: Analyze ──────────────────────────────────
    const analysis = this.autoloop.analyze();
    yield { emit: 'render', format: 'markdown', value: analysis };

    // ── Step 6: Ask LLM to improve the prompt ────────────
    const improvePrompt = {
      ask: 'improve',
      message: `Based on the analysis above, improve this prompt/template.\n\n**Current version:**\n\`\`\`\n${currentPrompt}\n\`\`\`\n\n**Instructions:** ${this.state.target}\n\nReturn the improved version as plain text (no code fences).`,
    };

    const improvedContent: any = yield improvePrompt;

    if (!improvedContent || typeof improvedContent !== 'string') {
      return { error: 'No improvement received from LLM.' };
    }

    // ── Step 7: Apply or queue for approval ──────────────
    const changesSummary = `Iteration ${this.state.totalRuns + 1}: LLM-generated improvement based on ${dataPoints.length} data points`;

    if (autoApply) {
      try {
        await this.call(target, 'update', {
          content: improvedContent,
          ...(instance ? { _use: instance } : {}),
        });
        this.autoloop.improve({ changes: changesSummary });
        this.autoloop.apply({ content: improvedContent });
        this.state.totalRuns++;
        this.state.lastRun = new Date().toISOString();

        yield { emit: 'status', message: 'Improvement applied automatically' };
        return {
          iteration: this.state.totalRuns,
          applied: true,
          autoApply: true,
          timestamp: this.state.lastRun,
        };
      } catch (e: any) {
        return { error: `Failed to apply: ${e.message}` };
      }
    }

    // Human approval flow
    const approval = yield {
      ask: 'confirm',
      message: `Apply this improvement?\n\n**Changes:** ${changesSummary}\n\n**New version:**\n${improvedContent.slice(0, 500)}${improvedContent.length > 500 ? '...' : ''}`,
    };

    if (approval) {
      try {
        await this.call(target, 'update', {
          content: improvedContent,
          ...(instance ? { _use: instance } : {}),
        });
        this.autoloop.improve({ changes: changesSummary });
        this.autoloop.apply({ content: improvedContent });
      } catch (e: any) {
        return { error: `Failed to apply: ${e.message}` };
      }

      this.state.totalRuns++;
      this.state.lastRun = new Date().toISOString();

      return {
        iteration: this.state.totalRuns,
        applied: true,
        timestamp: this.state.lastRun,
      };
    }

    this.autoloop.improve({ changes: changesSummary });
    this.autoloop.reject();
    return { iteration: this.state.totalRuns, applied: false, rejected: true };
  }

  /**
   * Schedule recurring optimization runs
   *
   * Pass target (photon name), interval (cron or @daily/@hourly/@weekly),
   * instance (optional _use name), and autoApply (skip approval).
   */
  async start({ target, interval, instance, autoApply }: ScheduleConfig) {
    const scheduleName = `autorun-${this.state.target || target}`;

    await this.schedule.create({
      name: scheduleName,
      schedule: interval,
      method: 'run',
      params: { target, instance, autoApply: autoApply ?? false },
    });

    this.state.target = target;
    this.state.instance = instance;
    this.state.scheduled = true;
    this.state.scheduleName = scheduleName;

    return {
      scheduled: true,
      target,
      instance,
      interval,
      autoApply: autoApply ?? false,
      name: scheduleName,
    };
  }

  /**
   * Stop the scheduled optimization loop
   */
  async stop() {
    if (!this.state.scheduleName) {
      throw new Error('No active schedule. Use `start` first.');
    }

    await this.schedule.cancelByName(this.state.scheduleName);
    this.state.scheduled = false;

    return { stopped: true, name: this.state.scheduleName };
  }

  /**
   * View the research log from the underlying autoloop
   *
   * @format table
   * @readOnly
   */
  log() {
    return this.autoloop.log();
  }

  /**
   * Export full research log for model handoff
   *
   * @readOnly
   */
  async handoff() {
    return this.autoloop.export();
  }

  /**
   * Current state of the runner
   *
   * @format kv
   * @readOnly
   */
  status() {
    return {
      target: this.state.target || '(not set)',
      instance: this.state.instance || '(default)',
      totalRuns: this.state.totalRuns,
      lastRun: this.state.lastRun || 'never',
      scheduled: this.state.scheduled,
      scheduleName: this.state.scheduleName || '(none)',
    };
  }
}
