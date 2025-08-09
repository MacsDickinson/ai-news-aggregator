# Claude Instructions

## Project Overview
AI News Commentator - An AI-driven platform that curates news from RSS feeds and APIs, provides AI-powered elaborations with strict attribution, enables personal commentary capture through Q&A, and generates publishable drafts for LinkedIn and Substack with automated roundup scheduling.

**MVP Scope (Milestone 1)**:
- Curated feed from RSS + News APIs + light web search
- Per-item cards (headline, source, time, blurb, trust score)
- Actions: Interesting, Elaborate, Save, Dismiss
- One-click Elaborate (150-250 words) + 3-5 takeaways + citations + "Why it matters"
- 3-5 Q&A prompts to capture personal POV (saved to item)
- Draft generator: LinkedIn (short) + Substack (long) with templates, hashtags, titles
- Rich-text editor + prompt-edits + version history
- OAuth: LinkedIn + Substack; copy-to-clipboard fallback
- Saved items → Roundup generator (daily/weekly/monthly)
- Simple scheduler + notifications
- Settings: topics, keywords, regions, sources, template presets, privacy toggle

## Architecture
**Principles**: Serverless-first, AWS-native, TypeScript end-to-end, strict attribution handling

**Proposed Stack**:
- **Frontend**: Next.js/Remix + React + TypeScript
- **Backend**: Lambda functions + API Gateway
- **Database**: DynamoDB (primary) + OpenSearch (search/ranking) + S3 (cache)
- **Auth**: Cognito or Clerk/Auth0
- **AI**: OpenAI (primary) + Anthropic (fallback)
- **Queue**: SQS for ingestion pipeline
- **Scheduler**: EventBridge for roundups
- **Analytics**: Kinesis Firehose → S3 + QuickSight
- **Security**: Secrets Manager for OAuth tokens, KMS encryption

## Tech Stack
- **Backend**: Node.js + TypeScript (Lambda functions)
- **Frontend**: React + TypeScript (Next.js/Remix)
- **Database**: DynamoDB + OpenSearch + PostgreSQL (legacy)
- **AI Integration**: OpenAI API + Anthropic (fallback)
- **Testing**: Vitest
- **Infrastructure**: AWS Serverless (Lambda, API Gateway, S3, CloudFront)
- **Future**: React Native + TypeScript (Expo) for mobile

## Development Commands
- Install: `npm install`
- Dev server: `npm run dev` (starts backend on port 3001, frontend on port 3000)
- Build: `npm run build`
- Test: `npm run test`
- Test (watch): `npm run test:watch`
- Lint: `npm run lint`
- Type check: `npm run type-check`
- Database migrate: `npm run db:migrate`
- Database seed: `npm run db:seed`
- Clean builds: `npm run clean`

## Project Structure
- `/backend` - Express.js API server
- `/frontend` - Remix.js web application
- `/shared` - Shared TypeScript types and utilities
- `/docs` - Project documentation and PRD
- `/tests` - Test files
- `/database` - Database migrations and seeds

## Current Milestone: Milestone 1
**Goal**: End-to-end AI news curation with personalized drafting and publishing

## Coding Guidelines
- Write TypeScript with strict mode enabled
- Follow test-driven development - write tests first
- Use JSDoc comments for all public functions
- Follow existing code style and conventions
- Validate with `npm run lint` and `npm run type-check`
- All features must be tested with Vitest
- Focus on defensive security practices only

## Git Commit Rules
- **NEVER commit to main** unless explicitly told to (and then seek double confirmation)
- **NEVER add watermarks, signatures, or AI-generated footers to commit messages**
- **NO "Generated with Claude Code" or "Co-Authored-By: Claude" lines**
- Keep commit messages clean and professional
- Use format: `MAC-123: description` (derive Jira issue from branch name)
- Branch naming: `type/personid-linearid-description` (e.g., `feature/macs-MAC-121-ticket-prd`)

**Development Process**:
1. **Make Changes**: Implement features, write tests, update docs
2. **Validate Code**: ALWAYS run validation before committing:
   - `npm run lint` - Check code style and catch basic issues
   - `npm run type-check` - Verify TypeScript compilation
   - Fix any errors before proceeding
3. **Review Changes**: `git status` and `git diff` to review all modifications
4. **Stage Files**: `git add <files>` (stage only relevant files)
5. **Commit Changes**: `git commit -m "<type>: <description>"`
   - Derive issue number from branch name
   - Keep messages concise and professional

**IMPORTANT**: Never commit code without running validation steps. This ensures:
- Code quality and consistency
- TypeScript type safety
- Early error detection
- Clean CI pipeline runs

**Commit Message Types**: 
- `feat:` for new features
- `fix:` for bug fixes
- `test:` for test additions
- `chore:` for infrastructure tasks
- `refactor:` for code improvements

**PR Creation Process**:
1. Review all changes in branch vs main: `git diff main...HEAD`
2. Run full test suite: `npm run test`
3. Create PR with descriptive title and body
4. Include "Test plan" section with validation steps
5. Tag reviewers if needed

**Important**: 
- Always validate code with lint/typecheck before committing
- Only commit working, tested code
- Never commit directly to main
- All changes must go through PR process

## Data Model (Key Tables)
**DynamoDB Tables**:
- `Users` - user profiles and preferences
- `Sources` - RSS feeds and API sources with trust scores
- `Items` - normalized articles with dedupe clustering
- `UserItemState` - user actions (viewed, saved, dismissed)
- `Elaborations` - AI summaries with citations
- `QnAResponses` - user commentary per item
- `Drafts` - generated content with version history
- `Roundups` - scheduled content compilations
- `Tokens` - encrypted OAuth credentials

**OpenSearch Index**: `items_idx` for ranking and search

## LLM Integration & Prompts
**Provider Strategy**:
- Primary: OpenAI GPT-5 (cost/latency optimized)
- Fallback: Anthropic Haiku
- Hard guardrails: Force citations, no claims without source anchors

**Key Prompts**:
- **Elaboration**: 150-250 word synthesis + 3-5 takeaways + citations
- **Q&A**: 3-5 POV prompts (Who benefits/loses? What could fail? Startup implications?)
- **Draft Generation**: Platform-specific (LinkedIn/Substack) with user POV integration
- **Citation Policy**: Post-generation validator enforces ≥1 citation per elaboration

## Acceptance Criteria
- **Time-to-feed**: New user sees ≥10 relevant items within 120s
- **Elaborate latency**: p50 ≤ 4s, p95 ≤ 8s
- **Citation integrity**: 100% of elaborations have ≥1 valid source link
- **Q&A persistence**: Answers survive page refresh and appear in drafts
- **Draft constraints**: LinkedIn ≤ 3,000 chars with overflow prevention
- **Publish flow**: Valid OAuth tokens return post URL and success status
- **Roundup schedule**: Auto-generated drafts appear on user's local schedule

## Implementation Notes
- Follow implementation plan in `docs/milestone-1-implementation-plan.md`
- Use Server Components (Next.js 15 or Remix) with React 19
- Editor: TipTap or Lexical with Markdown import/export
- Keyboard-first UX: j/k navigation, e=elaborate, s=save, d=dismiss
- Feature flags via DynamoDB + edge caching
- Attribution footer: "Sources: [Title 1](url1), [Title 2](url2)..."

## External Dependencies
- OpenAI API key (primary LLM provider)
- Anthropic API key (fallback LLM provider)
- LinkedIn API OAuth (w_member_social scope)
- Substack API or email-based tokens
- News APIs: NewsAPI, Guardian API, or RSS feeds
- AWS services: Lambda, DynamoDB, OpenSearch, S3, EventBridge