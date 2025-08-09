# AI News Commentator

An AI-driven platform that curates news from RSS feeds and APIs, provides AI-powered elaborations with strict attribution, enables personal commentary capture through Q&A, and generates publishable drafts for LinkedIn and Substack.

## Project Structure

This is a monorepo containing the following packages:

```
.
├── backend/          # Express.js API server (Node.js + TypeScript)
├── frontend/          # Remix web application (React + TypeScript)
├── shared/            # Shared types, utilities, and validation schemas
├── database/          # Database schemas and migrations
├── docs/             # Project documentation
└── tests/            # Integration and E2E tests
```

## Tech Stack

- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: Remix + React + TypeScript + Tailwind CSS
- **Database**: DynamoDB + OpenSearch + PostgreSQL (legacy)
- **AI Integration**: OpenAI API + Anthropic (fallback)
- **Testing**: Vitest
- **Infrastructure**: AWS Serverless (Lambda, API Gateway, S3, CloudFront)

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- AWS CLI configured (for development)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MacsDickinson/ai-news-aggregator.git
   cd ai-news-aggregator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

### Development

1. Start the development servers:
   ```bash
   npm run dev
   ```

   This starts both the backend (port 3001) and frontend (port 3000) in development mode.

2. Build all packages:
   ```bash
   npm run build
   ```

3. Run tests:
   ```bash
   npm run test
   ```

4. Run linting and type checking:
   ```bash
   npm run lint
   npm run type-check
   ```

## API Documentation

The backend provides the following API endpoints:

- `GET /api/feed` - Get curated news feed
- `POST /api/item/:id/elaborate` - Generate AI elaboration
- `POST /api/item/:id/action` - Mark item as interesting/dismiss/save
- `POST /api/drafts/generate` - Generate draft from item + Q&A
- `GET /api/preferences` - Get/update user preferences

See the [API Documentation](docs/api.md) for complete details.

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure tests pass:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Database Setup

### DynamoDB Tables

The application uses the following DynamoDB tables:
- `Users` - User profiles and preferences
- `Items` - Normalized articles
- `Elaborations` - AI summaries with citations
- `Drafts` - Generated content
- And more... (see `database/dynamodb/table-definitions.json`)

### Local Development

For local development, you can use DynamoDB Local or connect to AWS DynamoDB.

## Architecture

The system follows a serverless-first, AWS-native architecture:

- **Frontend**: Remix app deployed to CloudFront + S3
- **Backend**: Lambda functions behind API Gateway
- **Database**: DynamoDB for primary storage, OpenSearch for search/ranking
- **AI Processing**: OpenAI/Anthropic integration with citation validation
- **Publishing**: OAuth integrations for LinkedIn/Substack

See the [Implementation Plan](docs/milestone-1-implementation-plan.md) for detailed architecture diagrams.

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Ensure all checks pass before submitting a PR
4. Follow the commit message format: `type: description`

## License

MIT License - see LICENSE file for details.