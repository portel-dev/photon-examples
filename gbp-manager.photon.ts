/**
 * GBP Manager — Google Business Profile Optimization for Local Services
 *
 * Automated Google Business Profile management that finds local service
 * businesses with weak profiles, audits them, responds to reviews,
 * generates posts, and delivers monthly performance reports.
 *
 * Each instance (`_use`) is one client business:
 *   `_use('ace-plumbing')`
 *   `_use('cool-air-hvac')`
 *   `_use('summit-roofing')`
 *
 * ## Revenue Model
 *
 * | Tier | Price | What's Included |
 * |------|-------|-----------------|
 * | Review Management | $199/mo | Review responses, alerts, sentiment tracking |
 * | Growth Package | $299/mo | + Weekly posts, photo optimization, competitor watch |
 * | Full Service | $499/mo | + Monthly report, audit fixes, GBP SEO, direct support |
 *
 * ## Tools (all free)
 *
 * | Step | Tool |
 * |------|------|
 * | Scan & Audit | `agent-browser` → Google Maps |
 * | Review Responses | `gws gmail +send` to notify, LLM drafts |
 * | Weekly Posts | LLM generates, agent-browser publishes |
 * | Reports | LLM generates, `gws gmail +send` delivers |
 * | Follow-ups | `gws calendar +insert` for reminders |
 *
 * Setup: `npm install -g @googleworkspace/cli && gws auth login`
 *
 * @version 1.0.0
 * @stateful
 * @icon 📍
 * @tags business, google-business-profile, local-seo, reviews, automation
 */

import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';

// ── Types ────────────────────────────────────────────────────

interface BusinessProfile {
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  mapsUrl: string;
  rating: number;
  reviewCount: number;
  photoCount: number;
  postFrequency: string;
  responseRate: number;
  lastPostDate?: string;
  competitors?: CompetitorSnapshot[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  responded: boolean;
  response?: string;
  respondedAt?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface Post {
  id: string;
  type: 'update' | 'offer' | 'event' | 'tip';
  content: string;
  date: string;
  published: boolean;
  engagement?: { views: number; clicks: number };
}

interface CompetitorSnapshot {
  name: string;
  rating: number;
  reviewCount: number;
  lastChecked: string;
}

interface AuditResult {
  score: number;
  maxScore: number;
  findings: Array<{
    area: string;
    status: 'good' | 'needs-work' | 'critical';
    detail: string;
    fix: string;
  }>;
  auditedAt: string;
}

interface MonthlyReport {
  month: string;
  reviewsReceived: number;
  reviewsResponded: number;
  avgRating: number;
  ratingChange: number;
  postsPublished: number;
  competitorComparison: CompetitorSnapshot[];
  highlights: string[];
  recommendations: string[];
  generatedAt: string;
}

interface ManagerState {
  profile: BusinessProfile | null;
  reviews: Review[];
  posts: Post[];
  audits: AuditResult[];
  reports: MonthlyReport[];
  responseTemplate: string;
  postTemplate: string;
  tier: 'review' | 'growth' | 'full';
}

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'gbp-manager');

// ── Default Templates ────────────────────────────────────────

const DEFAULT_RESPONSE_TEMPLATE = `# Review Response Template

## 5-Star Reviews
- Thank them by name
- Reference something specific they mentioned
- Invite them back with a specific reason
- Keep under 50 words

## 4-Star Reviews
- Thank them warmly
- Acknowledge what went well
- Gently ask what would make it 5 stars
- Keep under 60 words

## 3-Star Reviews
- Thank them for honest feedback
- Acknowledge their concern specifically
- Explain what you're doing to improve
- Invite them to reach out directly
- Keep under 80 words

## 1-2 Star Reviews
- Apologize sincerely (never defensively)
- Don't argue or make excuses
- Take the conversation offline: "Please call us at [phone]"
- Show you take it seriously
- Keep under 80 words

## Rules
- Always use their first name
- Never copy-paste the same response twice
- Reference specific details from their review
- End with the business owner's first name
- Never offer discounts publicly (do that offline)
`;

const DEFAULT_POST_TEMPLATE = `# Weekly GBP Post Template

## Post Types (rotate weekly)
1. **Tip** — seasonal maintenance advice relevant to your trade
2. **Before/After** — showcase a recent job (with permission)
3. **Team Spotlight** — introduce a team member, their expertise
4. **Seasonal Offer** — timely promotion tied to weather/season

## Rules
- Under 300 words (Google truncates longer posts)
- Include a call-to-action: "Call us at [phone]" or "Book online at [website]"
- Use 1-2 relevant keywords naturally (e.g., "emergency plumber in [city]")
- Photo suggestion for each post
- Tone: professional but friendly, local business feel
- Never mention competitors by name
`;

export default class GbpManager {
  private state: ManagerState = {
    profile: null,
    reviews: [],
    posts: [],
    audits: [],
    reports: [],
    responseTemplate: DEFAULT_RESPONSE_TEMPLATE,
    postTemplate: DEFAULT_POST_TEMPLATE,
    tier: 'growth',
  };

  private get dataDir() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    return DATA_DIR;
  }

  // ══════════════════════════════════════════════════════════
  // PROSPECTING — Find and pitch new clients
  // ══════════════════════════════════════════════════════════

  /**
   * Find local service businesses with weak Google profiles
   *
   * Use agent-browser to search Google Maps for a trade in a city.
   * Returns businesses sorted by opportunity (low reviews, low rating,
   * no recent posts = high opportunity).
   *
   * Example:
   *   `agent-browser open "https://google.com/maps/search/plumber+in+Austin+TX"`
   *   `agent-browser snapshot -i` → click each listing → extract details
   *
   * @param trade Service trade to search for {@example plumber}
   * @param city City and state {@example Austin TX}
   * @param results Array of business profiles found
   * @format table
   */
  prospect({ trade, city, results }: {
    trade: string;
    city: string;
    results: Array<{
      name: string;
      rating: number;
      reviewCount: number;
      website?: string;
      phone?: string;
      mapsUrl?: string;
    }>;
  }) {
    return results
      .map(r => {
        let opportunity = 0;
        if (r.reviewCount < 20) opportunity += 3;
        else if (r.reviewCount < 50) opportunity += 1;
        if (r.rating < 4.0) opportunity += 3;
        else if (r.rating < 4.5) opportunity += 1;
        return { ...r, opportunity, trade, city };
      })
      .sort((a, b) => b.opportunity - a.opportunity)
      .map(r => ({
        name: r.name,
        rating: `${r.rating} ⭐`,
        reviews: r.reviewCount,
        opportunity: r.opportunity >= 4 ? '🔴 High' : r.opportunity >= 2 ? '🟡 Medium' : '🟢 Low',
        website: r.website || '—',
        phone: r.phone || '—',
      }));
  }

  /**
   * Generate a pitch email for a prospective client
   *
   * Creates a personalized pitch showing their profile weaknesses
   * vs competitors, with a clear value proposition.
   *
   * @param name Business name
   * @param email Business email
   * @param rating Their current Google rating
   * @param reviewCount Their review count
   * @param topCompetitor Competitor name with better profile
   * @param competitorRating Competitor's rating
   * @param competitorReviews Competitor's review count
   * @format markdown
   */
  pitch({ name, email, rating, reviewCount, topCompetitor, competitorRating, competitorReviews }: {
    name: string;
    email: string;
    rating: number;
    reviewCount: number;
    topCompetitor: string;
    competitorRating: number;
    competitorReviews: number;
  }) {
    const ratingGap = (competitorRating - rating).toFixed(1);
    const reviewGap = competitorReviews - reviewCount;

    return `## Pitch Email for ${name}

**To:** ${email}
**Subject:** ${name} — you're losing calls to ${topCompetitor}

### The Data
- **${name}:** ${rating} stars, ${reviewCount} reviews
- **${topCompetitor}:** ${competitorRating} stars, ${competitorReviews} reviews
- **Gap:** ${ratingGap} stars, ${reviewGap} reviews behind

### Email Draft

Hi [Owner Name],

I was looking at ${name}'s Google profile and noticed something — ${topCompetitor} has ${competitorReviews} reviews at ${competitorRating} stars, while ${name} has ${reviewCount} at ${rating}.

That gap means ${topCompetitor} is showing up first when people search for [trade] in [city]. Every week that gap grows, that's calls going to them instead of you.

I help local service businesses close that gap. Here's what I'd do for ${name}:
- Respond to every review within 24 hours (builds trust + boosts ranking)
- Post weekly updates to your Google profile (keeps you visible)
- Track your rating vs competitors monthly

Most clients see their rating improve within 60 days. It's $299/month and pays for itself with one extra job.

Want to see a sample report for ${name}? Just reply and I'll send one over.

Best,
[Your Name]

---

**Send with:** \`gws gmail +send --to "${email}" --subject "${name} — you're losing calls to ${topCompetitor}" --body "..."\``;
  }

  // ══════════════════════════════════════════════════════════
  // ONBOARDING — Set up a new client
  // ══════════════════════════════════════════════════════════

  /**
   * Onboard a new client — set up their business profile
   *
   * Store the client's business details. This is the starting point
   * for all management — reviews, posts, audits, and reports reference
   * this profile.
   *
   * @param profile Business profile details
   */
  onboard({ profile }: { profile: BusinessProfile }) {
    this.state.profile = profile;
    return {
      name: profile.name,
      category: profile.category,
      rating: `${profile.rating} ⭐ (${profile.reviewCount} reviews)`,
      responseRate: `${profile.responseRate}%`,
      status: 'Onboarded — ready for audit',
      next: 'Run `audit` to get a full profile assessment',
    };
  }

  /**
   * Set the service tier for this client
   *
   * @param tier Service tier {@format segmented}
   */
  tier({ tier }: { tier: 'review' | 'growth' | 'full' }) {
    this.state.tier = tier;
    const pricing = { review: '$199/mo', growth: '$299/mo', full: '$499/mo' };
    return { tier, price: pricing[tier] };
  }

  // ══════════════════════════════════════════════════════════
  // AUDIT — Full profile assessment
  // ══════════════════════════════════════════════════════════

  /**
   * Run a full Google Business Profile audit
   *
   * Scores the profile across 10 areas and provides specific fixes.
   * Use agent-browser to visit their Google Maps listing and assess each area.
   *
   * Areas scored:
   * - Star rating (vs 4.5 benchmark)
   * - Review count (vs 50 benchmark)
   * - Review response rate (vs 100% target)
   * - Response speed (within 24h)
   * - Post frequency (weekly target)
   * - Photo count and quality
   * - Business info completeness (hours, services, description)
   * - Q&A section activity
   * - Category accuracy
   * - Competitor positioning
   *
   * @param findings Array of audit findings from the assessment
   */
  audit({ findings }: {
    findings: Array<{
      area: string;
      status: 'good' | 'needs-work' | 'critical';
      detail: string;
      fix: string;
    }>;
  }) {
    const score = findings.reduce((sum, f) => {
      if (f.status === 'good') return sum + 10;
      if (f.status === 'needs-work') return sum + 5;
      return sum;
    }, 0);

    const result: AuditResult = {
      score,
      maxScore: findings.length * 10,
      findings,
      auditedAt: new Date().toISOString(),
    };
    this.state.audits.push(result);

    const critical = findings.filter(f => f.status === 'critical');
    const needsWork = findings.filter(f => f.status === 'needs-work');

    return {
      score: `${score}/${result.maxScore}`,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      critical: critical.length,
      needsWork: needsWork.length,
      good: findings.filter(f => f.status === 'good').length,
      topFixes: critical.concat(needsWork).slice(0, 5).map(f => ({
        area: f.area,
        status: f.status,
        fix: f.fix,
      })),
      next: 'Fix critical items first, then run `audit` again to track improvement',
    };
  }

  /**
   * View audit history showing improvement over time
   *
   * @format table
   * @readOnly
   */
  audits() {
    return this.state.audits.map((a, i) => ({
      '#': i + 1,
      date: a.auditedAt.split('T')[0],
      score: `${a.score}/${a.maxScore}`,
      critical: a.findings.filter(f => f.status === 'critical').length,
      needsWork: a.findings.filter(f => f.status === 'needs-work').length,
    }));
  }

  // ══════════════════════════════════════════════════════════
  // REVIEWS — Monitor, respond, track sentiment
  // ══════════════════════════════════════════════════════════

  /**
   * Import reviews from the Google Business Profile
   *
   * Use agent-browser to visit the Maps listing, click "Reviews",
   * sort by newest, and extract each review's author, rating, text, date,
   * and whether it has a response.
   *
   * @param reviews Array of reviews to import
   */
  reviews({ reviews }: { reviews: Review[] }) {
    for (const review of reviews) {
      const existing = this.state.reviews.findIndex(r => r.id === review.id);
      if (existing >= 0) {
        this.state.reviews[existing] = { ...this.state.reviews[existing], ...review };
      } else {
        this.state.reviews.push(review);
      }
    }

    const unanswered = this.state.reviews.filter(r => !r.responded);
    return {
      imported: reviews.length,
      total: this.state.reviews.length,
      unanswered: unanswered.length,
      avgRating: +(this.state.reviews.reduce((s, r) => s + r.rating, 0) / this.state.reviews.length).toFixed(1),
      next: unanswered.length > 0
        ? `${unanswered.length} reviews need responses — run \`respond\``
        : 'All reviews responded to ✓',
    };
  }

  /**
   * Get unanswered reviews that need responses
   *
   * Returns reviews sorted by priority: negative first (damage control),
   * then by date (newest first).
   *
   * @format table
   * @readOnly
   */
  unanswered() {
    return this.state.reviews
      .filter(r => !r.responded)
      .sort((a, b) => a.rating - b.rating || new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(r => ({
        id: r.id,
        author: r.author,
        rating: '⭐'.repeat(r.rating),
        text: r.text.slice(0, 80) + (r.text.length > 80 ? '...' : ''),
        date: r.date,
        priority: r.rating <= 2 ? '🔴 Urgent' : r.rating === 3 ? '🟡 Soon' : '🟢 Normal',
      }));
  }

  /**
   * Draft a response to a review using the response template
   *
   * Returns the template guidelines and review details so the LLM
   * can craft a personalized response following the proven patterns.
   *
   * @param id Review ID to respond to
   * @format markdown
   */
  respond({ id }: { id: string }) {
    const review = this.state.reviews.find(r => r.id === id);
    if (!review) throw new Error(`Review ${id} not found`);
    if (review.responded) return `Already responded to ${review.author}'s review.`;

    const profile = this.state.profile;

    return `## Draft Response to ${review.author}'s ${review.rating}-Star Review

**Review:**
> ${review.text}

**Date:** ${review.date}
**Business:** ${profile?.name || '(set via onboard)'}
**Phone:** ${profile?.phone || ''}

### Response Template
${this.state.responseTemplate}

---

Write a response following the ${review.rating}-star guidelines above.
After drafting, use \`replied\` to save the response.`;
  }

  /**
   * Save a review response (after the LLM drafts it)
   *
   * @param id Review ID
   * @param response The response text to save
   */
  replied({ id, response }: { id: string; response: string }) {
    const review = this.state.reviews.find(r => r.id === id);
    if (!review) throw new Error(`Review ${id} not found`);

    review.responded = true;
    review.response = response;
    review.respondedAt = new Date().toISOString();
    review.sentiment = review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative';

    const remaining = this.state.reviews.filter(r => !r.responded).length;
    return {
      author: review.author,
      rating: review.rating,
      responded: true,
      remaining,
      hint: 'Post the response on Google Maps via agent-browser, then use `gws gmail +send` to notify the client.',
    };
  }

  // ══════════════════════════════════════════════════════════
  // POSTS — Weekly Google Business Profile content
  // ══════════════════════════════════════════════════════════

  /**
   * Draft a weekly Google Business Profile post
   *
   * Returns the post template and business context so the LLM can
   * generate relevant, engaging content. Rotates through post types
   * automatically.
   *
   * @param type Post type {@format segmented}
   * @format markdown
   */
  draft({ type }: { type?: 'update' | 'offer' | 'event' | 'tip' }) {
    const profile = this.state.profile;
    const postCount = this.state.posts.length;
    const types: Array<'tip' | 'update' | 'offer' | 'event'> = ['tip', 'update', 'offer', 'event'];
    const autoType = type || types[postCount % types.length];

    return `## Draft GBP Post — ${autoType.charAt(0).toUpperCase() + autoType.slice(1)}

**Business:** ${profile?.name || '(set via onboard)'}
**Category:** ${profile?.category || ''}
**Location:** ${profile?.address || ''}
**Post #:** ${postCount + 1}
**Type:** ${autoType}

### Template
${this.state.postTemplate}

---

Write a **${autoType}** post for ${profile?.name || 'this business'}.
After drafting, use \`post\` to save it.`;
  }

  /**
   * Save a drafted post
   *
   * @param content Post text content
   * @param type Post type
   */
  post({ content, type }: { content: string; type?: 'update' | 'offer' | 'event' | 'tip' }) {
    const id = `post-${Date.now()}`;
    const entry: Post = {
      id,
      type: type || 'update',
      content,
      date: new Date().toISOString(),
      published: false,
    };
    this.state.posts.push(entry);

    return {
      id,
      type: entry.type,
      length: `${content.length} chars`,
      saved: true,
      hint: 'Publish via agent-browser on the Google Business Profile, then run `published` to mark it live.',
    };
  }

  /**
   * Mark a post as published
   *
   * @param id Post ID
   */
  published({ id }: { id: string }) {
    const post = this.state.posts.find(p => p.id === id);
    if (!post) throw new Error(`Post ${id} not found`);
    post.published = true;
    return { id, published: true, date: post.date };
  }

  /**
   * View post history
   *
   * @format table
   * @readOnly
   */
  history() {
    return this.state.posts.map(p => ({
      id: p.id,
      type: p.type,
      date: p.date.split('T')[0],
      published: p.published ? '✓' : '—',
      preview: p.content.slice(0, 60) + (p.content.length > 60 ? '...' : ''),
    }));
  }

  // ══════════════════════════════════════════════════════════
  // COMPETITORS — Track and compare
  // ══════════════════════════════════════════════════════════

  /**
   * Record competitor snapshots for comparison
   *
   * Use agent-browser to check competitor Google profiles and
   * record their current rating and review count.
   *
   * @param competitors Array of competitor snapshots
   * @format table
   */
  competitors({ competitors }: { competitors: CompetitorSnapshot[] }) {
    if (this.state.profile) {
      this.state.profile.competitors = competitors;
    }
    return competitors.map(c => ({
      name: c.name,
      rating: `${c.rating} ⭐`,
      reviews: c.reviewCount,
      checked: c.lastChecked,
    }));
  }

  // ══════════════════════════════════════════════════════════
  // REPORTS — Monthly performance reports
  // ══════════════════════════════════════════════════════════

  /**
   * Generate a monthly performance report
   *
   * Compiles all activity from the past month: reviews received and
   * responded to, rating changes, posts published, competitor comparison,
   * and recommendations for next month.
   *
   * Send to client via `gws gmail +send` with the report attached.
   *
   * @param month Month label {@example March 2026}
   * @param highlights Key wins this month
   * @param recommendations Suggestions for next month
   * @format markdown
   */
  report({ month, highlights, recommendations }: {
    month: string;
    highlights: string[];
    recommendations: string[];
  }) {
    const profile = this.state.profile;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentReviews = this.state.reviews.filter(
      r => new Date(r.date) >= thirtyDaysAgo
    );
    const respondedCount = recentReviews.filter(r => r.responded).length;
    const avgRating = this.state.reviews.length > 0
      ? +(this.state.reviews.reduce((s, r) => s + r.rating, 0) / this.state.reviews.length).toFixed(1)
      : 0;

    const recentPosts = this.state.posts.filter(
      p => p.published && new Date(p.date) >= thirtyDaysAgo
    );

    const previousReport = this.state.reports[this.state.reports.length - 1];
    const ratingChange = previousReport ? +(avgRating - previousReport.avgRating).toFixed(1) : 0;

    const entry: MonthlyReport = {
      month,
      reviewsReceived: recentReviews.length,
      reviewsResponded: respondedCount,
      avgRating,
      ratingChange,
      postsPublished: recentPosts.length,
      competitorComparison: profile?.competitors || [],
      highlights,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
    this.state.reports.push(entry);

    let md = `# Monthly Report — ${month}\n## ${profile?.name || 'Client'}\n\n`;
    md += `### Performance Summary\n`;
    md += `| Metric | Value |\n|---|---|\n`;
    md += `| Current Rating | ${avgRating} ⭐ (${ratingChange >= 0 ? '+' : ''}${ratingChange}) |\n`;
    md += `| Reviews This Month | ${recentReviews.length} |\n`;
    md += `| Response Rate | ${recentReviews.length > 0 ? Math.round((respondedCount / recentReviews.length) * 100) : 100}% |\n`;
    md += `| Posts Published | ${recentPosts.length} |\n`;
    md += `| Total Reviews | ${this.state.reviews.length} |\n\n`;

    if ((profile?.competitors || []).length > 0) {
      md += `### Competitor Comparison\n`;
      md += `| Business | Rating | Reviews |\n|---|---|---|\n`;
      md += `| **${profile!.name} (You)** | **${avgRating}** | **${this.state.reviews.length}** |\n`;
      for (const c of profile!.competitors!) {
        md += `| ${c.name} | ${c.rating} | ${c.reviewCount} |\n`;
      }
      md += '\n';
    }

    md += `### Highlights\n${highlights.map(h => `- ${h}`).join('\n')}\n\n`;
    md += `### Recommendations for Next Month\n${recommendations.map(r => `- ${r}`).join('\n')}\n\n`;

    md += `---\n*Report generated by ${profile?.name || 'GBP Manager'}*\n`;
    md += `\n**Send with:** \`gws gmail +send --to "${profile?.email}" --subject "${profile?.name} — Google Profile Report ${month}" --body "..."\``;

    return md;
  }

  // ══════════════════════════════════════════════════════════
  // TEMPLATES — Customize response & post templates
  // ══════════════════════════════════════════════════════════

  /**
   * Update the review response template
   *
   * This template guides the LLM when drafting review responses.
   * Autoloop can optimize this based on which response styles
   * lead to updated ratings or "helpful" votes.
   *
   * @param template New response template content
   */
  responses({ template }: { template: string }) {
    this.state.responseTemplate = template;
    return { updated: true, length: template.length };
  }

  /**
   * Update the weekly post template
   *
   * This template guides the LLM when drafting GBP posts.
   * Autoloop can optimize based on post engagement metrics.
   *
   * @param template New post template content
   */
  posts({ template }: { template: string }) {
    this.state.postTemplate = template;
    return { updated: true, length: template.length };
  }

  // ══════════════════════════════════════════════════════════
  // AUTORESEARCH INTERFACE — for autoloop/autorun integration
  // ══════════════════════════════════════════════════════════

  /**
   * Returns the current response template (AutoResearch interface)
   *
   * Autorun calls this to get the template being optimized.
   *
   * @readOnly
   * @internal
   */
  prompt() {
    return this.state.responseTemplate;
  }

  /**
   * Binary eval criteria for review responses (AutoResearch interface)
   *
   * Used by autorun to score response quality.
   *
   * @readOnly
   * @internal
   */
  criteria() {
    return [
      { label: 'uses-name', question: 'Does the response address the reviewer by their first name?' },
      { label: 'specific-ref', question: 'Does it reference something specific from the review text?' },
      { label: 'no-copy-paste', question: 'Does it feel unique and not like a template copy-paste?' },
      { label: 'appropriate-tone', question: 'Does the tone match the review rating (grateful for 5-star, empathetic for 1-star)?' },
      { label: 'under-limit', question: 'Is the response under 80 words?' },
      { label: 'has-cta', question: 'Does it include a next step (come back, call us, etc.)?' },
      { label: 'owner-signed', question: 'Is it signed with a name (not "The Team" or anonymous)?' },
      { label: 'no-defensive', question: 'For negative reviews: does it avoid being defensive or making excuses?' },
    ];
  }

  /**
   * Pull performance data for autoloop (AutoResearch interface)
   *
   * Returns review responses with their "effectiveness" metric:
   * whether the reviewer updated their rating or marked the response helpful.
   *
   * @readOnly
   * @internal
   */
  pull() {
    return this.state.reviews
      .filter(r => r.responded && r.response)
      .map(r => ({
        id: r.id,
        content: r.response!,
        metric: r.rating, // higher rating = better response relationship
        date: r.respondedAt || r.date,
      }));
  }

  /**
   * Update the response template (AutoResearch interface)
   *
   * Called by autorun when it generates an improved template.
   *
   * @internal
   */
  update({ content }: { content: string }) {
    this.state.responseTemplate = content;
    return { updated: true };
  }

  // ══════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════

  /**
   * Client dashboard — overview of all activity
   *
   * @format kv
   * @readOnly
   */
  status() {
    const profile = this.state.profile;
    const unanswered = this.state.reviews.filter(r => !r.responded).length;
    const avgRating = this.state.reviews.length > 0
      ? +(this.state.reviews.reduce((s, r) => s + r.rating, 0) / this.state.reviews.length).toFixed(1)
      : profile?.rating || 0;

    return {
      client: profile?.name || '(not onboarded)',
      tier: this.state.tier,
      rating: `${avgRating} ⭐`,
      totalReviews: this.state.reviews.length,
      unanswered,
      postsPublished: this.state.posts.filter(p => p.published).length,
      audits: this.state.audits.length,
      reports: this.state.reports.length,
      lastAuditScore: this.state.audits.length > 0
        ? `${this.state.audits[this.state.audits.length - 1].score}/${this.state.audits[this.state.audits.length - 1].maxScore}`
        : '—',
    };
  }
}
