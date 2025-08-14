import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  flags: z.record(z.boolean()).optional(),
  privacyPrefs: z.object({
    personalisation: z.boolean(),
    analytics: z.boolean(),
    sharing: z.boolean(),
  }).optional(),
  defaultVoice: z.string().optional(),
  templateId: z.string().optional(),
});

// Source schemas
export const SourceSchema = z.object({
  sourceId: z.string().uuid(),
  url: z.string().url(),
  type: z.enum(['rss', 'api']),
  name: z.string().min(1).max(200),
  trustScore: z.number().min(0).max(1),
  isRecommended: z.boolean(),
  addedBy: z.string().optional(),
  lastFetchedAt: z.string().datetime().optional(),
});

// Item schemas
export const ItemSchema = z.object({
  itemId: z.string().uuid(),
  variantId: z.string().optional(),
  canonicalUrl: z.string().url(),
  title: z.string().min(1).max(500),
  sourceId: z.string().uuid(),
  publishedAt: z.string().datetime(),
  abstract: z.string().min(1).max(1000),
  trustScore: z.number().min(0).max(1),
  hash: z.string(),
  clusterId: z.string().optional(),
  authors: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  region: z.string().optional(),
});

export const ItemCardSchema = z.object({
  itemId: z.string().uuid(),
  title: z.string(),
  source: z.object({
    id: z.string().uuid(),
    name: z.string(),
    url: z.string().url(),
  }),
  publishedAt: z.string().datetime(),
  abstract: z.string(),
  trust: z.object({
    score: z.number().min(0).max(1),
    label: z.string(),
  }),
  whyShown: z.array(z.string()).optional(),
  actions: z.object({
    canElaborate: z.boolean(),
  }),
  canonicalUrl: z.string().url(),
});

// Action schemas
export const ActionRequestSchema = z.object({
  type: z.enum(['interesting', 'dismiss', 'save']),
});

// Elaboration schemas
export const CitationSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  outlet: z.string().min(1).max(100),
});

export const ElaborationSchema = z.object({
  userId: z.string().uuid(),
  itemId: z.string().uuid(),
  summary: z.string().min(150).max(250),
  takeaways: z.array(z.string()).min(3).max(5),
  whyItMatters: z.string().min(1).max(500),
  citations: z.array(CitationSchema).min(1),
  llmMeta: z.object({
    model: z.string(),
    latencyMs: z.number(),
  }).optional(),
});

export const ElaborateResponseSchema = z.object({
  summary: z.string(),
  takeaways: z.array(z.string()),
  whyItMatters: z.string(),
  citations: z.array(CitationSchema),
});

// Draft schemas
export const GenerateDraftRequestSchema = z.object({
  platform: z.enum(['linkedin', 'substack']),
  itemId: z.string().uuid(),
  qaSessionId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  style: z.string().optional(),
});

export const GenerateDraftResponseSchema = z.object({
  titleOptions: z.array(z.string()).min(1).max(3),
  bodyMarkdown: z.string().min(1),
  hashtags: z.array(z.string()).max(10),
});

export const DraftSchema = z.object({
  userId: z.string().uuid(),
  draftId: z.string().uuid(),
  platform: z.enum(['linkedin', 'substack', 'roundup']),
  title: z.string().min(1).max(200),
  bodyMarkdown: z.string().min(1),
  hashtags: z.array(z.string()).optional(),
  templateId: z.string().uuid().optional(),
  fromItemId: z.string().uuid().optional(),
  fromQnAId: z.string().uuid().optional(),
  version: z.number().int().positive(),
  history: z.array(z.object({
    version: z.number().int().positive(),
    diff: z.string(),
    at: z.string().datetime(),
  })).optional(),
  status: z.enum(['draft', 'published', 'exported']),
});

// Feed schemas
export const FeedQuerySchema = z.object({
  topic: z.string().optional(),
  source: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const FeedResponseSchema = z.object({
  items: z.array(ItemCardSchema),
  nextCursor: z.string().optional(),
});

// Preferences schemas
export const PreferencesSchema = z.object({
  userId: z.string().uuid(),
  topics: z.array(z.string()),
  keywords: z.array(z.string()),
  regions: z.array(z.string()),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  blockedSources: z.array(z.string().uuid()),
});

// Q&A schemas
export const QnAAnswerSchema = z.object({
  qId: z.string(),
  text: z.string().min(1).max(500),
});

export const QnAResponseSchema = z.object({
  userId: z.string().uuid(),
  itemId: z.string().uuid(),
  qaSessionId: z.string().uuid(),
  answers: z.array(QnAAnswerSchema).min(1).max(5),
});

// Analytics schemas
export const AnalyticsEventSchema = z.object({
  type: z.string(),
  userId: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  props: z.record(z.unknown()),
});

// Error schemas
export const APIErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

// Environment schemas
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  DYNAMODB_TABLE_PREFIX: z.string().default('ai-news-aggregator'),
  OPENSEARCH_ENDPOINT: z.string().optional(),
  JWT_SECRET: z.string(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  SUBSTACK_CLIENT_ID: z.string().optional(),
  SUBSTACK_CLIENT_SECRET: z.string().optional(),
});