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
- **Testing**: Vitest + Supertest
- **Infrastructure**: AWS Serverless (Lambda, API Gateway, S3, CloudFront)
- **Local Development**: LocalStack + Docker Compose
- **IaC**: Terraform with LocalStack support
- **CI/CD**: GitHub Actions with security scanning
- **Code Quality**: ESLint + Prettier + Husky + lint-staged

## Quick Start

### Prerequisites

- Node.js 24+ and npm 9+
- Docker and Docker Compose (for LocalStack)
- AWS CLI configured (for production deployment)
- OpenAI API key
- Anthropic API key (optional, for fallback)
- Terraform CLI (for infrastructure management)

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
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp shared/.env.example shared/.env
   # Edit .env files with your API keys and configuration
   ```

4. Start LocalStack services:

   ```bash
   npm run docker:up
   npm run localstack:init
   ```

5. Initialize infrastructure (optional):
   ```bash
   npm run infra:init
   npm run infra:plan
   npm run infra:apply
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
   npm run test           # Run all tests
   npm run test:watch     # Run tests in watch mode
   ```

4. Run linting and type checking:

   ```bash
   npm run lint           # Run ESLint
   npm run type-check     # Run TypeScript compilation
   npm run validate       # Run all validation (lint + type-check + test)
   ```

5. Format code:

   ```bash
   npm run format         # Format all code with Prettier
   npm run format:check   # Check formatting without changes
   ```

6. Docker services:

   ```bash
   npm run docker:up      # Start LocalStack services
   npm run docker:down    # Stop services
   npm run docker:logs    # View service logs
   npm run docker:clean   # Clean up containers and volumes
   ```

7. Infrastructure management:
   ```bash
   npm run infra:init     # Initialize Terraform
   npm run infra:plan     # Plan infrastructure changes
   npm run infra:apply    # Apply infrastructure changes
   ```

## API Documentation

The backend provides the following API endpoints:

- `GET /api/feed` - Get curated news feed
- `POST /api/item/:id/elaborate` - Generate AI elaboration
- `POST /api/item/:id/action` - Mark item as interesting/dismiss/save
- `POST /api/drafts/generate` - Generate draft from item + Q&A
- `GET /api/preferences` - Get/update user preferences

**Health Check Endpoints:**

- `GET /health` - Basic service health
- `GET /health/detailed` - Detailed health with system info
- `GET /health/providers` - AI provider health status

See the [API Documentation](docs/api.md) for complete details.

## Development Workflow

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following TDD approach:

   ```bash
   # Write tests first, then implement
   npm run test:watch     # Keep tests running while developing
   npm run validate       # Ensure all validation passes
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

For local development, we use LocalStack to emulate AWS services:

```bash
# Start LocalStack services
npm run docker:up

# Initialize LocalStack with required services
npm run localstack:init

# Check service logs
npm run docker:logs
```

LocalStack provides:

- DynamoDB Local
- S3 Local
- Lambda Local
- Other AWS services for testing

For production deployment, configure AWS credentials and deploy with Terraform.

## Architecture

The system follows a serverless-first, AWS-native architecture:

- **Frontend**: Remix app deployed to CloudFront + S3
- **Backend**: Lambda functions behind API Gateway
- **Database**: DynamoDB for primary storage, OpenSearch for search/ranking
- **AI Processing**: OpenAI/Anthropic integration with citation validation
- **Publishing**: OAuth integrations for LinkedIn/Substack

See the [Implementation Plan](docs/milestone-1-implementation-plan.md) for detailed architecture diagrams.

## Contributing

1. **Follow TDD**: Write tests before implementing features
2. **Code Quality**: Follow existing style conventions (enforced by ESLint/Prettier)
3. **Pre-commit Hooks**: Code is automatically validated before commits
4. **Commit Format**: Use conventional commits (`feat:`, `fix:`, `chore:`, etc.)
5. **Testing**: Ensure all tests pass with `npm run validate`
6. **Environment**: Test with LocalStack before deploying

### Code Quality Gates

The following checks run automatically:

- **Pre-commit**: Prettier formatting, TypeScript compilation, tests
- **CI/CD**: Full validation, security scanning, infrastructure checks
- **Commit Messages**: Enforced conventional format

### Development Environment

- Uses LocalStack for AWS service emulation
- Terraform for infrastructure as code
- Docker Compose for service orchestration
- Comprehensive health monitoring
- AI provider fallback system

## License

MIT License - see LICENSE file for details.
