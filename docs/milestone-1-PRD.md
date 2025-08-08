# AI News Commentator – Milestone 1 (MVP) PRD

### TL;DR

A lean MVP that delivers a curated tech/AI news feed with one-click elaborations and clear citations, a short Q&A to capture the user’s personal perspective, instant draft generation for LinkedIn and Substack, and an automated weekly roundup draft. The focus is speed to value and safe, attributable content that avoids plagiarism while helping creators publish consistently.

---

## Goals

### Business Goals

* Validate usefulness: 70% of active users generate at least one draft in week 1.

* Establish publishing cadence: 1+ post published per user per week via LinkedIn/Substack.

* Early engagement signal: median engagement rate (reactions + comments) ≥ baseline benchmark for user’s last 5 posts.

* Collect actionable feedback: 10+ structured beta feedback submissions by end of milestone.

### User Goals

* Fast discovery: see a relevant tech/AI feed within 2 minutes of onboarding.

* Effortless drafting: generate a credible LinkedIn/Substack draft in under 5 minutes.

* Authentic voice: inject a personal POV via a 30–60 second Q&A flow.

* Confidence in attribution: every elaboration includes sources with clear links.

### Non-Goals

* Advanced scheduling (full CRON-like scheduling UI and multi-recurrence workflows).

* Multi-platform expansion beyond LinkedIn and Substack.

* Collaboration (multi-user workspaces, shared drafts) and real-time cross-platform analytics dashboards.

* Native mobile apps (mobile web acceptable for MVP).

---

## User Stories

### Tech Professional / Creator (Primary)

* As a creator, I want to set topics and keywords quickly, so that my feed immediately reflects my interests in tech/AI.

* As a creator, I want to see headlines with short blurbs, so that I can decide at a glance what’s worth exploring.

* As a creator, I want one-click elaboration with citations, so that I can understand the context without leaving the app.

* As a creator, I want a short Q&A to capture my point of view, so that my posts feel personal and original.

* As a creator, I want to generate and edit a LinkedIn or Substack draft, so that I can publish with minimal friction.

### Admin / Owner (You)

* As an admin, I want to add/remove recommended sources and default tech presets, so that new users get a strong out-of-the-box feed.

* As an admin, I want to monitor basic system health and API rate limits, so that I can keep the MVP reliable.

* As an admin, I want to view aggregate usage (e.g., drafts generated per user), so that I can assess product-market fit signals.

* As an admin, I want the ability to toggle features (feature flags), so that I can roll out changes safely.

### System (Scheduler)

* As the system, I want to fetch and deduplicate content periodically, so that the feed stays fresh without duplicates.

* As the system, I want to auto-generate a weekly roundup draft, so that users can quickly curate and publish summaries.

* As the system, I want to retry failed API calls with backoff, so that transient errors don’t degrade user experience.

---

## Functional Requirements

* Feed & Curation (Priority: P0)

  * Source Management: Allow users to add, remove, and block sources; seed a recommended list the user can edit at any time.

  * Preferences: Topics, keywords, regions, and publications; explicit includes/excludes per user.

  * Fetcher: Periodic polling plus lightweight web search; deduplication; freshness and relevance scoring.

  * Ranking & Personalization: Combine explicit preferences with click/save/elaborate signals; always show why an item is shown and allow overrides.

  * Item Card: Headline, source, timestamp, 1–2 sentence abstract; actions: Elaborate, Save, Dismiss; persistent canonical URL.

  * Attribution & Compliance: Display source attribution on all derivative outputs and store the canonical link with the item.

* Summarization & Elaboration (Priority: P0)

  * One-Click Elaborate: 150–250 word summary with 3–5 key takeaways and citations.

  * Context "Why It Matters": Short paragraph connecting to broader trend or business impact.

  * Q&A for Personal Take: 3–5 thought-provoking prompts; answers are saved to the item and reused in drafts.

  * Style Controls: Free-text instructions per draft (tone, audience, constraints) plus selectable presets (e.g., Concise, Analytical, Conversational).

* Drafting & Publishing (Priority: P0)

  * Draft Generator: Create drafts from item + Q&A + style; output templates for LinkedIn (short-form) and Substack (long-form); suggested titles and hashtags.

  * Editor: In-app rich-text editor; edit directly or via a follow-up prompt; version history with the ability to restore.

  * Publish/Export: Direct publish to LinkedIn and Substack when connected; otherwise copy-ready exports (Markdown and plain text).

  * Engagement Ingest: After publish, capture basic metrics (views/likes/comments) where API access allows; manual input fallback.

* Roundups & Scheduling (Priority: P0)

  * Saved Items: Automatically collect all items the user Saved or Elaborated.

  * Roundup Generator: User selects period (daily/weekly/monthly), picks items, reorders, and generates an AI-assisted draft; template suggestions included.

  * Scheduling: Simple recurring schedules (daily/weekly/monthly) with notification; CRON-like options are design-ready but not required for MVP.

* Settings & Accounts (Priority: P0)

  * Auth & Connections: Email sign-in; OAuth for LinkedIn/Substack; revoke at any time.

  * Templates: Manage post and roundup templates; set a default voice; override per draft.

  * Privacy Controls: Toggle personalization on/off; view/edit data used for personalization.

---

## User Experience

**Entry Point & First-Time User Experience**

* Access via web app; sign in and connect LinkedIn/Substack (optional at first run).

* Quick setup wizard:

  * Choose presets (AI, ML, cloud infra, dev tools) and add custom topics/keywords/regions.

  * Review recommended sources; add/remove; import any RSS link; block known low-trust sources.

  * Confirm attribution policy (always cite), privacy notice, and publishing permissions.

**Core Experience**

* Step 1: View Curated Feed

  * Minimal, scannable cards: headline, source, timestamp, 1–2 sentence blurb, trust indicator.

  * Filters: topic/source; “saved for roundup.”

  * Error handling: show placeholders with retry on fetch failures.

* Step 2: Triage Items

  * Actions on card: Interesting, Elaborate, Dismiss, Save for Roundup.

  * Feedback loop: choices inform personalization v0.

* Step 3: Elaborate an Item

  * Click Elaborate opens a side panel/modal.

  * Show synthesized summary with citations and “why it matters.”

  * Display all sources with outbound links; identify low-trust flags.

  * Provide Q&A (3–5 prompts). User can skip or answer briefly.

  * Validation: ensure Q&A chars within limits; warn on empty answers; save partial responses.

* Step 4: Generate Draft

  * Choose output: LinkedIn or Substack; pick a template; optional free-text instructions (tone, audience).

  * Generate draft; highlight sections derived from user Q&A.

  * Provide in-app edit controls; show character count for LinkedIn.

* Step 5: Publish or Copy

  * Publish via API where allowed; otherwise prominent copy-to-clipboard.

  * Confirm success with link or instructions; log event for analytics.

* Step 6: Weekly/Daily/Monthly Roundup

  * Auto-generated draft appears per schedule using saved items.

  * User curates: reorder, remove, or elaborate sections; regenerate with AI assist.

  * Publish to Substack or copy for LinkedIn article.

**Advanced Features & Edge Cases**

* Paywalled Articles: Do not fetch full text; rely on summaries/metadata; always link to source.

* Duplicates: Merge variants by URL/title; provide “see related coverage.”

* Low-Trust Sources: Show warning banner; allow user to block or proceed.

* API Failures/Rate Limits: Graceful fallback messages, retries with backoff, and queued publishing.

* Token Expiry: Prompt to re-connect platform; preserve drafts.

* Content Hallucinations: Require at least one citation per claim; display disclaimer if sources are weak.

**UI/UX Highlights**

* Clear, consistent citations with outbound links; hover previews where possible.

* Accessible design: WCAG AA color contrast, semantic headings, focus states, keyboard navigation for triage and editing.

* Responsive web layout (desktop-first; mobile web usable); native apps out-of-scope.

* Inline status to show generation/publishing progress; undo for dismiss actions.

* Keyboard-centric flow: j/k to navigate, e to elaborate, s to save, d to dismiss.

---

## Narrative

Macs signs in to the AI News Commentator and selects the AI, cloud infrastructure, and developer tools presets. He adds a few keywords—“agentic workflows,” “vector databases”—and removes a publication he doesn’t trust. Within minutes, a clean feed appears with headlines and short blurbs. One story catches his eye about a new open-source LLM tool. He clicks Elaborate, and the app produces a concise synthesis with citations to two reputable sources and a brief “why this matters.”

A short Q&A prompts Macs to share his take: who benefits, where it could fail, and the business impact for startups. Using that POV, he generates a LinkedIn draft with a starter template. He tweaks the headline, trims a sentence to fit LinkedIn limits, and hits Publish. The post includes citations and a clear attribution line, which gives him confidence he’s not inadvertently plagiarizing.

Throughout the week, Macs marks several items as Interesting or saves them for a roundup. On Friday, the app creates a weekly roundup draft pulling in saved items, grouped by theme. Macs removes one redundant story, adds a brief intro paragraph via the AI assistant, and publishes to Substack. The result is a consistent, authentic publishing cadence with minimal overhead. Early engagement hints at what his audience values, guiding future templates and source tuning. The experience confirms the MVP’s value and highlights priorities for the next milestone: smarter personalization, richer analytics, and broader platform integrations.

---

## Success Metrics

### User-Centric Metrics

* Time-to-first-draft: median ≤ 5 minutes from first login to first draft.

* Elaborations per user per week: median ≥ 5.

* Weekly roundup completion rate: ≥ 50% of users who saved items generate a roundup draft.

### Business Metrics

* Early adopter sign-ups: ≥ 25 users in beta.

* Posts published via tool (LinkedIn/Substack): ≥ 1 per user per week on average.

* Engagement per post: maintain or exceed user’s personal baseline (e.g., +10% reactions/comments vs. prior 5 posts).

### Technical Metrics

* Summarization/elaboration latency: p50 ≤ 4s, p95 ≤ 8s.

* Uptime (core feed, drafting): ≥ 99.5% during beta.

* Draft generation error rate: ≤ 2% per week.

### Tracking Plan

* item_viewed, item_marked_interesting, item_dismissed, item_saved_for_roundup

* item_elaborated (with source_count, latency_ms)

* qna_started, qna_completed (answers_count)

* draft_generated (platform, template)

* draft_edited (chars_changed)

* draft_published (platform) or draft_copied

* roundup_created, roundup_published

* connect_platform_success/failure, token_refresh

* source_added, source_blocked, preference_updated

---

## Technical Considerations

### Technical Needs

* Components

  * Fetcher/Parser: RSS/news APIs, supported web search; HTML parsing and metadata extraction.

  * Dedupe/Classifier: Normalize items, cluster duplicates, tag topics/keywords.

  * Summarizer with Citations: Generate syntheses with in-text citations and source list.

  * Q&A Module: Present prompts, store responses, feed into drafting.

  * Draft Generator: Template-based content builder for LinkedIn/Substack.

  * Publisher Adapters: LinkedIn/Substack OAuth + publish/copy fallback.

  * Scheduler: Periodic fetching and weekly roundup generation with retry/backoff.

  * Analytics Collector: Event logging and basic metrics aggregation.

* Data Model (high level)

  * Users, Preferences (topics, keywords, regions, publications), Sources, Items (normalized articles), ItemRelations (duplicates), Drafts, QnAResponses, Roundups, EngagementMetrics, Tokens.

* APIs

  * External: LinkedIn, Substack, RSS/News APIs, search APIs (compliant with ToS).

  * Internal: REST endpoints for feed, elaborate, draft, publish, roundup, analytics.

### Integration Points

* LinkedIn and Substack OAuth + publishing endpoints.

* RSS/Atom feeds and reputable news APIs.

* Optional search APIs for discovery (respect robots.txt/ToS).

* Basic analytics pipeline (lightweight event store or hosted analytics).

### Data Storage & Privacy

* Store normalized metadata and short excerpts; do not store full paywalled content.

* Persist user Q&A responses and drafts; encrypt OAuth tokens at rest and in transit.

* Always link to original sources; include citations in outputs.

* Provide data export/delete options to support user privacy expectations.

### Scalability & Performance

* Initial load: single-digit users → dozens; design for low-cost operation.

* Batch fetch every 15–60 minutes; nightly compaction and dedupe.

* Caching for popular items; queue-based processing for elaborations/publishing.

### Potential Challenges

* Copyright and fair use: avoid full-text scraping; rely on metadata and permissible summaries.

* Hallucinations: enforce citation checks; display warnings for weak sourcing.

* Rate limits & ToS: implement backoff, caching, and respect platform policies.

* Platform constraints: LinkedIn/Substack APIs may limit features; ensure copy-to-clipboard fallback.

* Source quality variance: basic trust scoring and user controls to manage low-quality domains.

---

## Milestones & Sequencing

* Week 1: Ingestion + Feed

  * Deliverables: Source presets, RSS/API ingestion, dedupe/normalize, feed UI with actions (interesting, dismiss, save), basic filters, trust indicators.

  * Dependencies: Access to initial sources/APIs; hosting and auth setup.

* Week 2: Elaboration + Q&A + Citations

  * Deliverables: One-click elaboration with citations and “why it matters,” Q&A capture, integrate Q&A into elaborations and drafts, error handling and retries.

  * Dependencies: Summarization service, citation pipeline, prompt designs.

* Week 3: Drafting + LinkedIn/Substack Publishing + Weekly Roundup

  * Deliverables: Draft generator with templates, in-app editor, LinkedIn/Substack adapters with OAuth, copy-to-clipboard fallback, weekly roundup auto-draft with manual curation.

  * Dependencies: Platform OAuth credentials, publishing endpoints.

* Week 4: Polish, Analytics v0, Reliability

  * Deliverables: Performance tuning, accessibility pass, empty/error states, analytics events, basic dashboard, rate-limit handling, token refresh, beta onboarding checklist.

  * Dependencies: Analytics store, error monitoring, feature flags.

### Project Estimate

* Medium: 2–4 weeks. Scope can be trimmed to 2–3 weeks by limiting sources to a handful of RSS/news APIs and defaulting to copy-to-clipboard for publishing.

### Team Size & Composition

* Small Team (2 people)

  * 1 Full-Stack Engineer (backend + frontend + integrations)

  * 1 Product/Design Hybrid (PM, UX, content templates, QA)

* Optional: Part-time data/prompt engineer for summarization/citation tuning.

### Suggested Phases (Milestone 1 – \~4 Weeks)

* Phase 1 – Foundation (Week 1)

  * Deliverables: Recommended source list, user preferences (topics/keywords/regions/publications), ingestion + dedupe, item card UI, basic ranking.

  * Dependencies: Feed list and API keys.

* Phase 2 – Elaboration & Templates (Week 2)

  * Deliverables: One-click Elaborate summaries with citations, "Why It Matters" context, Q&A capture, tone presets, free-text style field.

  * Dependencies: LLM provider access and prompt library.

* Phase 3 – Drafting & Publishing (Week 3)

  * Deliverables: Draft generator (LinkedIn + Substack), in-app editor with prompt-based edits, OAuth connections, publish/copy export, attribution footers.

  * Dependencies: LinkedIn/Substack apps configured; test accounts.

* Phase 4 – Roundups & Scheduling (Week 4)

  * Deliverables: Saved items bucket, roundup generator (daily/weekly/monthly), simple recurring scheduler with notifications, engagement ingest (API or manual).

  * Dependencies: Notification service and background job runner.