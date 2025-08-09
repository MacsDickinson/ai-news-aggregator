# AI News Commentator – Milestone 1 (MVP) Implementation Plan

> A practical, build-ready plan converting the PRD into architecture, data schemas, APIs, prompts, UI flows, and a four‑week delivery roadmap for a two‑person team.

---

## 1) Product Scope Snapshot

**In-scope (MVP):**

- Curated feed from RSS + News APIs + light web search
- Per‑item cards (headline, source, time, blurb, trust)
- Actions: Interesting, Elaborate, Save, Dismiss
- One‑click Elaborate (150–250 words) + 3–5 takeaways + citations + “Why it matters”
- 3–5 Q&A prompts to capture POV (saved to item)
- Draft generator: LinkedIn (short) + Substack (long) with templates, hashtags, titles
- Rich‑text editor + prompt‑edits + version history
- OAuth: LinkedIn + Substack; copy‑to‑clipboard fallback
- Saved items → Roundup generator (daily/weekly/monthly)
- Simple scheduler (daily/weekly/monthly) + notifications
- Settings: topics, keywords, regions, sources (add/block), template presets, privacy toggle
- Analytics v0 per the tracking plan

**Out-of-scope (MVP):** Advanced scheduling UI, mobile apps, collaboration, multi‑platform beyond LinkedIn/Substack.

---

## 2) Architecture (proposed)

**Principles:** Serverless where possible, AWS‑native, TypeScript end‑to‑end for speed, strict attribution handling.

```
[Web App (Next.js/Remix)]
   ├─ UI (React) + Editor + Auth
   └─ API Routes (/api/*)
        │
        ├─ Feed Service (Lambda) —— SQS "ingest" —— Fetcher Workers (Lambda)
        │                                │
        │                                ├─ RSS/Atom
        │                                ├─ NewsAPI/Bing News (compliant)
        │                                └─ HTML Metadata Parser (read-only)
        │
        ├─ Dedupe/Classifier (Lambda) → OpenSearch (search) + DynamoDB (Items)
        │
        ├─ Summariser w/ Citations (Lambda) → LLM Provider(s)
        │
        ├─ Draft Service (Lambda) → DynamoDB (Drafts, QnA, Templates)
        │
        ├─ Publisher Adapters (LinkedIn/Substack, Lambda) → Secrets Manager (tokens)
        │
        ├─ Scheduler (EventBridge) → Roundup Generator (Lambda)
        │
        └─ Analytics (Kinesis Firehose → S3) + QuickSight (or PostHog cloud)

Shared: S3 (cache/exports), CloudFront (static), Cognito (Auth) or Clerk/Auth0
DB: DynamoDB (primary) + OpenSearch (rank/search) + S3 (raw cache)
Observability: CloudWatch, X-Ray, error alerts (SNS)
Feature Flags: Config in DynamoDB + edge-cached
```

**Why this stack?** Minimal ops, easy scaling, quick iteration, aligns with AWS infra and TypeScript preference. Optionally swap backend to Kotlin/Spring on ECS if desired later.

Here’s a sketched architecture diagram for the MVP based on the plan:

```
                  ┌──────────────────────────┐
                  │  Web App (Next.js/Remix) │
                  │  UI (React) + Auth       │
                  │  Editor + Feed           │
                  └─────────────┬────────────┘
                                │ API Routes (/api/*)
                                ▼
                      ┌──────────────────────┐
                      │ Backend (Lambdas)    │
                      ├──────────────────────┤
                      │ Feed Service         │
                      │  - Trigger SQS       │
                      │  - Fetcher Workers   │
                      │    * RSS/Atom        │
                      │    * News APIs       │
                      │    * HTML Parser     │
                      │ Dedupe & Classifier  │
                      │ Summariser (LLM)     │
                      │ Draft Service        │
                      │ Publisher Adapters   │
                      │ Scheduler            │
                      │ Analytics Collector  │
                      └─────────────┬────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
 ┌────────────────┐        ┌─────────────────┐       ┌─────────────────────┐
 │ DynamoDB       │        │ OpenSearch      │       │ S3 (Cache/Exports)  │
 │ - Users        │        │ - Search Index  │       │ - Raw Metadata      │
 │ - Preferences  │        │ - Ranking       │       │ - Assets            │
 │ - Items        │        └─────────────────┘       └─────────────────────┘
 │ - Drafts       │
 │ - QnA          │
 │ - Roundups     │
 │ - Tokens       │
 │ - Events       │
 └────────────────┘
          │
          ▼
 ┌───────────────────┐
 │ External Services │
 │ - LinkedIn API    │
 │ - Substack API    │
 │ - News APIs       │
 └───────────────────┘
```

This diagram shows:

- **Top layer:** Web app and user-facing UI
- **Middle layer:** API routes backed by AWS Lambdas handling business logic
- **Data layer:** DynamoDB, OpenSearch, S3 for persistence, search, and caching
- **External integrations:** Publishing platforms and news sources



---

## 2a) Architecture Diagrams (Mermaid)

> High-level system context, ingestion flow, and an end-to-end “Elaborate → Draft → Publish” sequence. Copy these into the repo README for quick onboarding.

### A) System Context

```
flowchart LR
  subgraph Client
    U[User (Browser)
Next.js/React]
  end

  subgraph Edge
    CF[CloudFront]
    S3S[Static S3]
  end

  subgraph App[Web App]
    API[/Next.js API Routes/]
    Auth[Cognito/Auth0]
  end

  subgraph Services[AWS Services]
    Feed[Feed Service
(Lambda)]
    Q[\"ingest\" Queue
(SQS)]
    F1[Fetcher Workers
(Lambda)]
    Dedupe[Dedupe/Classifier
(Lambda)]
    Summ[Summariser w/ Citations
(Lambda)]
    DraftsSvc[Draft Service
(Lambda)]
    Pub[Publisher Adapters
(Lambda)]
    Sched[Scheduler
(EventBridge)]
    Round[Roundup Generator
(Lambda)]
    Anal[Analytics Collector]
  end

  subgraph Data[Data Stores]
    DDBI[(DynamoDB: Items)]
    DDBU[(DynamoDB: UserItemState)]
    DDBE[(DynamoDB: Elaborations)]
    DDBD[(DynamoDB: Drafts/QnA/Templates)]
    DDBR[(DynamoDB: Roundups)]
    Flags[(DynamoDB: FeatureFlags)]
    OS[(OpenSearch: items_idx)]
    S3Raw[(S3: Raw Cache)]
    S3A[(S3: Analytics)]
    Secrets[Secrets Manager: Tokens]
  end

  subgraph External[3rd Parties]
    RSS[(RSS/Atom Feeds)]
    News[(News APIs)]
    HTMLP[HTML Metadata]
    LLM[(LLM Provider)]
    LI[[LinkedIn API]]
    SS[[Substack API]]
    BI[(QuickSight/PostHog)]
  end

  U -->|HTTPS| CF
  CF --> S3S
  U -->|HTTPS| API
  API --> Auth

  API --> Feed
  Feed --> Q
  Q --> F1
  F1 --> RSS
  F1 --> News
  F1 --> HTMLP
  F1 --> S3Raw
  F1 --> Dedupe
  Dedupe --> OS
  Dedupe --> DDBI

  API --> Summ
  Summ --> LLM
  Summ --> DDBE

  API --> DraftsSvc
  DraftsSvc --> DDBD

  API --> Pub
  Pub --> Secrets
  Pub --> LI
  Pub --> SS

  API --> Sched
  Sched --> Round
  Round --> DDBR

  API --> Anal
  Anal --> S3A
  S3A --> BI

  %% Observability
  classDef obs fill:#eef,stroke:#99f,stroke-width:1px;
```

### B) Ingestion & Ranking Flow

```
flowchart TB
  EV[EventBridge Timer
(15–60 min)] --> FBatch[Feed Batch Orchestrator
(Lambda)]
  FBatch --> Add[Resolve Sources
(seed + user-added RSS)]
  Add --> Fan[SQS Fan-out]
  Fan --> W1[Fetcher Worker
(Lambda)]
  Fan --> W2[Fetcher Worker
(Lambda)]
  W1 --> Meta[Extract metadata + canonical URL]
  W2 --> Meta
  Meta --> Cache[S3 Raw Cache]
  Meta --> Hash[SimHash/Jaro–Winkler]
style Hash stroke-dasharray: 3 3
  Hash --> Cluster[Cluster/Choose Canonical]
  Cluster --> Index[OpenSearch Index]
  Cluster --> Store[(DynamoDB Items)]
  Index --> Rank[Ranking]
  Store --> Rank
  Rank --> FeedAPI[/GET /api/feed
(topic, source, cursor)/]
```

### C) Elaborate → Draft → Publish (Sequence)

```
sequenceDiagram
  autonumber
  participant User
  participant Web as Web App (Next.js)
  participant API as API Routes
  participant Summ as Summariser (Lambda)
  participant LLM as LLM Provider
  participant Draft as Draft Service (Lambda)
  participant DDB as DynamoDB
  participant Pub as Publisher (Lambda)
  participant LI as LinkedIn
  participant SS as Substack

  User->>Web: Click "Elaborate"
  Web->>API: POST /item/{id}/elaborate
  API->>Summ: Invoke with item metadata
  Summ->>LLM: Prompt (citations required)
  LLM-->>Summ: JSON (summary, takeaways, why, citations)
  Summ->>DDB: Save elaboration
  Summ-->>API: Payload + latency
  API-->>Web: Render panel (citations)

  User->>Web: Answer Q&A, choose LinkedIn
  Web->>API: POST /drafts/generate {itemId, qa, style}
  API->>Draft: Invoke with inputs
  Draft->>DDB: Read item + Q&A + elaboration
  Draft->>LLM: Draft prompt
  LLM-->>Draft: body + titles + hashtags
  Draft->>DDB: Save draft (v1)
  Draft-->>API: draftId
  API-->>Web: Load editor (v1)
  User->>Web: Publish
  alt LinkedIn
    Web->>API: POST /drafts/{id}/publish (linkedin)
    API->>Pub: Invoke (linkedin)
    Pub->>DDB: Read token (Secrets)
    Pub->>LI: Create UGC Post
    LI-->>Pub: URL
  else Substack
    Web->>API: POST /drafts/{id}/publish (substack)
    API->>Pub: Invoke (substack)
    Pub->>DDB: Read token (Secrets)
    Pub->>SS: Create Draft/Publish
    SS-->>Pub: URL
  end
  Pub->>DDB: Update draft status
  Pub-->>API: {url}
  API-->>Web: Success + link
```

### D) Reliability & Scheduling (Bird’s-eye)

```
flowchart LR
  Flags[(Feature Flags)] -->|toggles| Web
  Web --> Events[Client Events]
  Events -->|batch/POST| API
  API --> Firehose[Kinesis Firehose]
  Firehose --> S3Analytics[(S3 Analytics)]
  S3Analytics --> BI[QuickSight/PostHog]

  Schedules[User Schedules] --> API
  API --> EB[EventBridge Rule per User]
  EB --> Round[Roundup Generator]
  Round --> DDBR[(Roundups)]
  Round --> Notify[Email/In‑app Notice]
```

---

## 3) Data Model (DynamoDB + OpenSearch)

**Tables (DynamoDB):**

1. `Users` (PK: userId)

   - email, displayName, createdAt, flags, privacyPrefs, defaultVoice/templateId

2. `Preferences` (PK: userId)

   - topics[], keywords[], regions[], includes[], excludes[], blockedSources[]

3. `Sources` (PK: sourceId)

   - url, type (rss/api), trustScore, isRecommended, addedBy, lastFetchedAt

4. `Items` (PK: itemId, SK: variantId)\
   *Normalized article + dedupe cluster*

   - canonicalUrl, title, sourceId, publishedAt, abstract, trustScore, hash, clusterId
   - meta: authors[], topics[], keywords[], region

5. `UserItemState` (PK: userId, SK: itemId)

   - state: {viewed, interesting, dismissed, saved}
   - signals: clicks, elaborates, timeOnCardMs

6. `Elaborations` (PK: userId, SK: itemId)

   - summary, takeaways[], whyItMatters, citations[] {title, url, outlet}
   - llmMeta (model, latencyMs)

7. `QnAResponses` (PK: userId, SK: `${itemId}#${qaSessionId}`)

   - answers[] {qId, text}

8. `Drafts` (PK: userId, SK: draftId)

   - platform (linkedin|substack|roundup), title, bodyMarkdown, hashtags[], templateId
   - fromItemId?, fromQnAId?, version, history[{version, diff, at}]
   - status: draft|published|exported

9. `Roundups` (PK: userId, SK: roundupId)

   - period (daily|weekly|monthly), itemIds[], generatedAt, title, bodyMarkdown

10. `Tokens` (PK: userId, SK: platform)

    - encryptedAccessToken, refreshToken, expiresAt

11. `FeatureFlags` (PK: flagKey)

    - enabled, rolloutPercent, notes

12. `Events` (PK: userId, SK: timestamp)

    - type, props (see Tracking Plan)

**Search Index (OpenSearch):** `items_idx`

- Fields: title, abstract, outlet, topics, keywords, publishedAt, trustScore
- Ranking: recency boost + trustScore + preference match + user signals

---

## 4) APIs (internal REST, /api/\*)

**Auth:** Cognito (hosted UI) → JWT to API routes.

1. **Feed**

- `GET /api/feed?topic=&source=&cursor=` → `{items: ItemCard[], nextCursor}`
- `POST /api/item/:id/action` body: `{type: "interesting|dismiss|save"}`
- `GET /api/item/:id` → full normalized item

2. **Sources & Preferences**

- `GET /api/preferences` | `PUT /api/preferences`
- `GET /api/sources/recommended` | `POST /api/sources` | `DELETE /api/sources/:id`

3. **Elaboration**

- `POST /api/item/:id/elaborate` → `{summary, takeaways[], whyItMatters, citations[]}`
- Idempotency key support via header `Idempotency-Key`

4. **Q&A**

- `GET /api/item/:id/qna` → `{prompts: Prompt[]}`
- `POST /api/item/:id/qna` body: `{answers: [{qId, text}]}`

5. **Drafts**

- `POST /api/drafts/generate` body: `{platform, itemId, qaSessionId, templateId?, style?}`
- `GET /api/drafts/:draftId` | `PUT /api/drafts/:draftId` | `POST /api/drafts/:draftId/restore`
- `POST /api/drafts/:draftId/publish` (uses platform adapter) → `{url?}`
- `POST /api/drafts/:draftId/export` → `{markdown, plaintext}`

6. **Roundups**

- `GET /api/roundups` | `POST /api/roundups/generate` body: `{period, itemIds[]}`
- `POST /api/roundups/:id/publish`

7. **Scheduler**

- `POST /api/schedule` body: `{periodicity: daily|weekly|monthly, hourLocal}` → stores EventBridge rule per user

8. **Analytics**

- `POST /api/events` batched client events → Kinesis Firehose
- `GET /api/admin/metrics` (aggregate, admin-only)

9. **Admin**

- `GET /api/admin/health` (LLM latency, API quotas)
- `POST /api/admin/feature-flags` (toggle)

**Response Contracts – ItemCard**

```
{
  itemId, title, source: {id, name, url},
  publishedAt, abstract,
  trust: {score, label},
  whyShown: ["matches: agentic workflows", "source: approved"],
  actions: {canElaborate: true},
  canonicalUrl
}
```

---

## 5) Ingestion & Dedupe

**Fetcher**

- EventBridge schedules: every 20 minutes per source batch
- Sources: seeded list + user‑added RSS
- For each feed entry: fetch metadata only (no paywall bypass), cache raw HTML headers in S3

**Dedupe**

- Generate `hash = simhash(title + canonicalUrl)`
- Cluster by title similarity (Jaro-Winkler > 0.92) & URL domain match
- Store `clusterId`; Items table stores a single normalized canonical (highest trust, earliest timestamp)

**Trust Scoring (v0)**

- Static list (e.g., official blogs, tier‑1 media) = high; unknown = medium; flagged domains = low (banner)

---

## 6) LLM Flows & Prompts

**Provider Strategy**

- Primary: OpenAI o4‑mini (cost/latency) or GPT‑4.1‑mini
- Fallback: Anthropic Haiku
- Hard guardrails: force citations; no claim without a source anchor

**Elaboration Prompt (system)**

```
You are an assistant that elaborates news with strict attribution.
Rules:
- 150–250 word synthesis + 3–5 bullet takeaways + a short "Why it matters" paragraph.
- Cite 2–4 reputable sources. Every non-obvious claim must be traceable.
- No quotes >25 words. Don’t hallucinate details. If sources disagree, note it.
- If article is paywalled, use metadata/other coverage; always link to originals.
Output JSON: {
  "summary": "...",
  "takeaways": ["..."],
  "whyItMatters": "...",
  "citations": [{"title": "", "url": "", "outlet": ""}]
}
```

**User‑POV Q&A (examples)**

1. Who benefits most from this development and who loses? (1–2 sentences)
2. Where could this approach fail in practice? (1 sentence)
3. What’s the most relevant implication for startups/enterprises? (1 sentence)
4. Would you adopt this today? Why/why not? (1 sentence)
5. What question would you ask the builders? (short)

**Draft Generator Prompt (system)**

```
You create publishable drafts that weave the user's POV into the news.
Constraints:
- Platform = {linkedin|substack}. Respect length/format norms.
- Include attribution: list sources at the end as "Sources:" with links.
- Use the user's Q&A where relevant; highlight the POV.
- Offer 2 title options and 6–10 relevant hashtags.
Return JSON: {
  "titleOptions": ["..."],
  "bodyMarkdown": "...",
  "hashtags": ["#AI", ...]
}
```

**Roundup Prompt (system)**

```
Create a weekly roundup from N saved items.
Structure: intro (2–3 sentences on theme), sections per item (2–3 sentences + 1 POV line), closing note.
Include Sources section with links. Output Markdown only.
```

**Citation Policy Enforcement**

- Post‑generation validator checks `citations.length >= 1` and each URL is distinct domain; if fail → regenerate once → else flag as weak‑sources.

---

## 7) UI/UX – Screens & Components

**Routes**

- `/onboarding` – presets, topics/keywords, sources, privacy
- `/feed` – main cards grid/list + filters
- `/item/:id` – details (if needed)
- `/drafts` – list + editor
- `/roundups` – list + generator modal
- `/settings` – preferences, templates, connections
- `/admin` – health, flags, usage (admin only)

**Components**

- ItemCard (headline, source, time, 1–2 sentence abstract, trust badge, actions)
- ElaboratePanel (summary/takeaways/why/citations + Q&A prompts)
- DraftEditor (Markdown + rich‑text toolbar; version history sidepanel)
- RoundupBuilder (select/reorder saved items; generate)
- SchedulerModal (simple recurring)
- ConnectionsPanel (LinkedIn/Substack OAuth + status)
- Toasts/Progress (generation/publishing)

**Keyboard Shortcuts**

- `j/k` navigate, `e` elaborate, `s` save, `d` dismiss

**Accessibility**

- WCAG AA palette, semantic headings, focus outlines, ARIA labels, skip‑to‑content

---

## 8) Publishing Adapters

**LinkedIn**

- OAuth: `w_member_social` scope
- Endpoint: `ugcPosts` (short text + links). Include source links in body
- Fallback: copy to clipboard with character counter

**Substack**

- OAuth to Substack API (where available) or email‑based token
- Endpoint: create draft post → optional publish
- Fallback: Markdown export

**Attribution Footer (standard)**

```
Sources: [Title 1]([url1]), [Title 2]([url2]), ...
```

---

## 9) Scheduling & Roundups

- EventBridge per‑user rule (e.g., FREQ=WEEKLY;BYDAY=FRI;BYHOUR=9 local)
- Lambda generates roundup draft from `Saved`/`Elaborated` items for the period
- Notification (email or in‑app) with link to draft

---

## 10) Reliability & Backoff

- All outbound API calls wrapped with retry (exponential backoff, jitter; max 3)
- Idempotency keys for publish/elaborate to avoid dupes
- Circuit breaker for LLM provider; fallback model
- Rate-limit aware fetcher (token bucket per domain)

---

## 11) Security & Privacy

- OAuth tokens encrypted at rest (KMS) + rotated
- Do not store full paywalled content; store metadata + short excerpts only
- Data export/delete endpoint for user
- Content policy banner for low‑trust sources

---

## 12) Analytics – Events & Metrics

**Client Events (batched):**

- `item_viewed`, `item_marked_interesting`, `item_dismissed`, `item_saved_for_roundup`
- `item_elaborated` {source\_count, latency\_ms}
- `qna_started`, `qna_completed` {answers\_count}
- `draft_generated` {platform, template}
- `draft_edited` {chars\_changed}
- `draft_published` {platform} | `draft_copied`
- `roundup_created`, `roundup_published`
- `connect_platform_success|failure`, `token_refresh`
- `source_added`, `source_blocked`, `preference_updated`

**Dashboards (admin):** MAU, time‑to‑first‑draft (median), elaborations/user/week (median), publish count per platform, error rates, LLM latency p50/p95.

---

## 13) Templates (initial set)

**LinkedIn Short**

- 600–1,000 chars; hook → context → POV → 1–2 actionable takeaways → sources

**Substack Long**

- 600–1,200 words; intro → sections per item → POV blocks → conclusion → sources

**Roundup**

- Thematic intro → items grouped by theme → closing call‑to‑action

---

## 14) Milestones – Functional Features (Milestone 1)

This milestone groups work by functional feature areas, prioritised for delivery.

### P0 Functional Features

- Auth & Preferences: Cognito auth, session middleware, preferences UI/API.
- Source Presets & Management: seed presets, CRUD sources, user blocklist/trust badges.
- Ingestion & Indexing: fetcher Lambdas, dedupe, OpenSearch indexing.
- Feed UX: ItemCard UI, actions (interesting/dismiss/save), filters, persisted state.
- Elaboration with Citations: Lambda generation, citation validator, latency targets.
- Q&A Capture: modal with 3–5 prompts, persisted per item.
- Draft Generation & Templates: LinkedIn/Substack templates wired to generator.
- Editor & Versioning: editor with version history, copy/export.
- Publishing Integrations: OAuth and happy-path publish to LinkedIn/Substack.
- Saved Items & Roundups: saved bucket, manual roundup generator.
- Scheduler & Notifications: recurring schedules and notifications.
- Analytics v0: events pipeline and basic admin dashboard.

### P1 Enhancements

- Low‑trust warnings using domain reputation list.
- Related coverage/duplicate merge UI.
- Import RSS OPML.
- Template manager UI.

---

## 15) Task Backlog (prioritised)

**P0**

- Auth (Cognito) + session middleware
- Preferences UI + API
- Source presets seed + management
- Fetcher Lambdas + SQS + OpenSearch indexing
- ItemCard UI + actions + persisted state
- Elaboration Lambda + citation validator
- Q&A UI + storage
- Draft generator Lambda + templates
- Editor with version history (client‑side JSON patches)
- LinkedIn/Substack OAuth + publish
- Saved items + Roundup generator
- Scheduler (EventBridge) + notifications
- Analytics pipeline + admin dashboard

**P1**

- Low‑trust warnings with domain reputation list
- Related coverage/duplicate merge UI
- Import RSS OPML
- Template manager UI

---

## 16) Acceptance Tests (samples)

1. **Time‑to‑feed:** New user completes onboarding in <120s and sees ≥10 items matching presets.
2. **Elaborate latency:** 20 article elaborations → p50 ≤ 4s, p95 ≤ 8s.
3. **Citation integrity:** 100 elaborations → 0 outputs without at least one valid link.
4. **Q&A persistence:** Refresh page; answers remain attached to item and appear in draft.
5. **Draft length:** LinkedIn drafts ≤ 3,000 chars; counter prevents overflow.
6. **Publish flow:** With valid tokens, LinkedIn publish returns a post URL and status recorded.
7. **Roundup schedule:** Weekly draft appears Friday 09:00 local for a test user.

---

## 17) Risks & Mitigations

- **Rate limits/ToS:** Cache aggressively; backoff; rotate providers; only metadata for paywalled.
- **Hallucinations:** Post‑gen validator; enforce citations; highlight weak‑source disclaimer.
- **Source quality:** Trust badges + user blocklist; admin curation.
- **Latency spikes:** Warm start via Provisioned Concurrency for hot Lambdas.
- **API changes:** Feature flags + canary users.

---

## 18) Implementation Notes

- Use Server Components friendly framework (Next.js 15 or Remix) with React 19.
- Editor: TipTap or Lexical with Markdown import/export.
- Versioning: client diffs stored as patches; full snapshot every N saves.
- Keyboard‑first UX from day 1; add command palette (Ctrl/Cmd‑K) for actions.
- i18n-ready copies but English‑only for MVP.

---

## 19) Initial Recommended Sources (seed)

- Official vendor blogs: OpenAI, Anthropic, Google AI, Meta AI, Microsoft Research, AWS ML, Azure, GCP, NVIDIA, Databricks, Hugging Face, OpenTelemetry
- Tier‑1 tech media: The Verge, TechCrunch, The Information (headlines only), Wired, MIT Tech Review, FT Tech, Economist Tech Quarterly
- Developer platforms: GitHub Blog, Vercel, Cloudflare, Fly.io, HashiCorp, JetBrains, Rust/Go/TS blogs
- Academic aggregators: arXiv (cs.AI, cs.CL), PapersWithCode (metadata)

---

## 20) Done‑for‑You Copy (onboarding & UI)

- **Attribution Policy:** “Every summarisation and draft includes clear source links. We never store full paywalled content.”
- **Low‑Trust Notice:** “This source has a lower trust score. Consider verifying before publishing.”
- **Privacy Toggle:** “Turn off personalisation to hide learning from your actions. You’ll still see a curated feed from your topics.”

---

## 21) Future‑Ready (post‑MVP)

- Smarter personalisation (embeddings + RAG on user history)
- Cross‑platform (X, Mastodon, Bluesky)
- Team workspaces; shared templates; analytics drill‑downs
- Browser extension for one‑click save/elaborate

---

**This plan is build‑ready.** Next action: create infra skeleton (repo, IaC, auth), seed sources, and ship Week 1 deliverables.

