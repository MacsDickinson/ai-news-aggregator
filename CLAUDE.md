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
- **Frontend**: React + TypeScript (Remix)
- **Database**: DynamoDB + OpenSearch + PostgreSQL (legacy)
- **AI Integration**: OpenAI API + Anthropic (fallback)
- **Testing**: Vitest + Supertest
- **Infrastructure**: AWS Serverless (Lambda, API Gateway, S3, CloudFront)
- **Local Development**: LocalStack + Docker Compose
- **IaC**: Terraform with LocalStack support
- **CI/CD**: GitHub Actions with security scanning
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Future**: React Native + TypeScript (Expo) for mobile

## Development Commands

- Install: `npm install`
- Dev server: `npm run dev` (starts backend on port 3001, frontend on port 3000)
- Build: `npm run build`
- Test: `npm run test`
- Test (watch): `npm run test:watch`
- Lint: `npm run lint`
- Type check: `npm run type-check`
- Validate: `npm run validate` (runs type-check + lint + test)
- Format: `npm run format` / `npm run format:check`
- Docker: `npm run docker:up` / `npm run docker:down` / `npm run docker:logs`
- LocalStack: `npm run localstack:init`
- Infrastructure: `npm run infra:init` / `npm run infra:plan` / `npm run infra:apply`
- Database migrate: `npm run db:migrate`
- Database seed: `npm run db:seed`
- Clean builds: `npm run clean`

## Project Structure

- `/backend` - Express.js API server with AI provider integrations
- `/frontend` - Remix.js web application
- `/shared` - Shared TypeScript types and utilities
- `/infrastructure` - Terraform configurations and deployment scripts
- `/scripts` - Development and deployment scripts
- `/docs` - Project documentation and PRD
- `/tests` - Test files
- `/database` - Database migrations and seeds
- `/.github` - CI/CD workflows and automation
- `/.husky` - Git hooks for code quality

## Current Milestone: Milestone 1

**Goal**: End-to-end AI news curation with personalized drafting and publishing

## Coding Guidelines

### MANDATORY Test-Driven Development (TDD)

- **ALWAYS write tests BEFORE implementing features**
- Use `npm run test:watch` during development to get immediate feedback
- Every new function, class, or module MUST have corresponding unit tests
- Tests should cover happy path, edge cases, and error conditions
- Minimum 80% code coverage for new code

### Code Quality Standards

- Write TypeScript with strict mode enabled
- Use JSDoc comments for all public functions
- Follow existing code style and conventions (enforced by ESLint/Prettier)
- All features must be tested with Vitest + Supertest
- Focus on defensive security practices only

### Pre-commit Validation

- Code is automatically formatted with Prettier
- TypeScript compilation is verified
- All tests must pass before commits
- Commit messages must follow conventional format

### Development Environment

- Use LocalStack for AWS service emulation
- Run `npm run validate` before every commit
- Keep Docker services running: `npm run docker:up`
- Initialize LocalStack: `npm run localstack:init`

## Git Commit Rules

- **NEVER commit to main** unless explicitly told to (and then seek double confirmation)
- **NEVER add watermarks, signatures, or AI-generated footers to commit messages**
- **NO "Generated with Claude Code" or "Co-Authored-By: Claude" lines**
- Keep commit messages clean and professional
- Use format: `MAC-123: description` (derive Jira issue from branch name)
- Branch naming: `type/personid-linearid-description` (e.g., `feature/macs-MAC-121-ticket-prd`)

**Development Process - MANDATORY TDD WORKFLOW**:

**For EVERY development task, Claude MUST follow this complete TDD process:**

1. **Write Tests FIRST**:
   - Create test file (e.g., `feature.test.ts`) before implementation
   - Write failing tests that define expected behavior
   - Use `npm run test:watch` to see tests fail (RED)
   - Tests should cover all requirements and edge cases

2. **Implement Minimum Code**:
   - Write just enough code to make tests pass (GREEN)
   - Focus on functionality, not optimization
   - Run tests frequently to ensure progress

3. **Refactor and Improve**:
   - Clean up code while keeping tests green (REFACTOR)
   - Add JSDoc comments and improve TypeScript types
   - Ensure code follows style guidelines

4. **Validate Complete Solution**:
   - `npm run validate` - Run ALL validation steps
   - `npm run build` - Ensure code compiles successfully
   - **Fix any errors before proceeding - NEVER commit failing code**

5. **Review and Commit**:
   - `git status` - See all modified files
   - `git diff` - Review all modifications line by line
   - `git add <files>` - Stage only relevant files
   - `git commit -m "<type>: <description>"` - Use conventional format

**TDD Benefits**:

- Prevents bugs before they're written
- Ensures comprehensive test coverage
- Documents expected behavior
- Enables confident refactoring
- Faster feedback loops during development

**CRITICAL**: Claude must ALWAYS commit changes after completing development tasks. This ensures:

- Progress is tracked and preserved
- Code quality validation is enforced
- TypeScript type safety is verified
- All tests pass before changes are saved
- Clean development workflow is maintained

**When to Commit**:

- After fixing bugs or errors
- After adding new features or functionality
- After creating or updating tests
- After refactoring or improving code
- After updating documentation or configuration
- **ANY time you make meaningful changes to the codebase**

**Commit Message Types**:

- `feat:` for new features
- `fix:` for bug fixes
- `test:` for test additions
- `chore:` for infrastructure tasks
- `refactor:` for code improvements

**PR Creation Process**:

1. Ensure LocalStack services are running: `npm run docker:up`
2. Review all changes in branch vs main: `git diff main...HEAD`
3. Run full validation: `npm run validate`
4. Test infrastructure: `npm run infra:plan` (if changes affect infrastructure)
5. Create PR with descriptive title and body
6. Include comprehensive "Test plan" section:
   - Unit tests added/modified
   - Integration test results
   - LocalStack validation
   - Manual testing steps
7. Verify CI/CD pipeline passes
8. Tag reviewers if needed

**Critical Requirements**:

- **TDD MANDATORY**: Write tests before implementation
- Always validate code with `npm run validate` before committing
- Only commit working, tested code with comprehensive test coverage
- Never commit directly to main
- All changes must go through PR process
- Use LocalStack for local AWS service testing
- Pre-commit hooks enforce code quality automatically
- Infrastructure changes must be validated with Terraform

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

## Local Development Setup

- Docker and Docker Compose (for LocalStack)
- LocalStack services (S3, DynamoDB, Lambda, etc.)
- Terraform CLI (for infrastructure management)
- Node.js 24+ and npm 9+

## Environment Configuration

- Root `.env` - Global configuration
- `backend/.env` - Backend-specific variables with AWS/AI provider config
- `frontend/.env` - Frontend-specific variables
- `shared/.env` - Shared environment variables
- All environments validated with Zod schemas

## Health Monitoring

- Service health: `GET /health`
- Detailed system info: `GET /health/detailed`
- AI provider status: `GET /health/providers`
- Provider manager with automatic fallback
- Health checks integrated into CI/CD pipeline
