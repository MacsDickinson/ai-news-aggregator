# Claude Instructions

## Project Overview
AI-driven news aggregation platform that aggregates news from diverse sources, summarizes key stories using AI, and enables social commentary. Currently implementing Milestone 1: Basic News Aggregation with weekly summaries for single topics.

## Tech Stack
- **Backend**: Node.js + TypeScript (Express)
- **Frontend**: React + TypeScript (Remix.js)
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
- **Testing**: Vitest
- **Future**: React Native + TypeScript (Expo) for mobile

## Development Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Test (watch): `npm run test:watch`
- Lint: `npm run lint`
- Type check: `npm run type-check`
- Database migrate: `npm run db:migrate`
- Database seed: `npm run db:seed`

## Project Structure
- `/backend` - Express.js API server
- `/frontend` - Remix.js web application
- `/shared` - Shared TypeScript types and utilities
- `/docs` - Project documentation and PRD
- `/tests` - Test files
- `/database` - Database migrations and seeds

## Current Milestone: Milestone 1 (Weeks 1-4)
**Goal**: Basic news aggregation workflow for single topics with weekly AI summaries

**Key Features**:
- Single topic news aggregation from RSS feeds and APIs
- AI-powered weekly summary generation
- Simple web interface for viewing summaries
- Basic source management

## Coding Guidelines
- Write TypeScript with strict mode enabled
- Follow test-driven development - write tests first
- Use JSDoc comments for all public functions
- Follow existing code style and conventions
- Validate with `npm run lint` and `npm run type-check`
- All features must be tested with Vitest
- Focus on defensive security practices only

## Implementation Notes
- Start with Milestone 1 implementation plan in `docs/milestone-1-implementation-plan.md`
- Target: Aggregate 50+ articles per week on chosen topic
- Use OpenAI API for summarization with proper rate limiting
- Design database schema to be extensible for future milestones
- Keep UI simple and focus on core aggregation functionality

## External Dependencies
- OpenAI API key required for summary generation
- News API access (NewsAPI, Guardian API, or similar)
- PostgreSQL database (local for dev, hosted for production)