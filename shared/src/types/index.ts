// User and Authentication types
export interface User {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  flags?: Record<string, boolean>;
  privacyPrefs?: PrivacyPreferences;
  defaultVoice?: string;
  templateId?: string;
}

export interface PrivacyPreferences {
  personalisation: boolean;
  analytics: boolean;
  sharing: boolean;
}

// Source and Content types
export interface Source {
  sourceId: string;
  url: string;
  type: 'rss' | 'api';
  name: string;
  trustScore: number;
  isRecommended: boolean;
  addedBy?: string;
  lastFetchedAt?: string;
}

export interface Item {
  itemId: string;
  variantId?: string;
  canonicalUrl: string;
  title: string;
  sourceId: string;
  publishedAt: string;
  abstract: string;
  trustScore: number;
  hash: string;
  clusterId?: string;
  authors?: string[];
  topics?: string[];
  keywords?: string[];
  region?: string;
}

export interface ItemCard {
  itemId: string;
  title: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
  publishedAt: string;
  abstract: string;
  trust: {
    score: number;
    label: string;
  };
  whyShown?: string[];
  actions: {
    canElaborate: boolean;
  };
  canonicalUrl: string;
}

// User interactions
export interface UserItemState {
  userId: string;
  itemId: string;
  state: 'viewed' | 'interesting' | 'dismissed' | 'saved';
  signals?: {
    clicks?: number;
    elaborates?: number;
    timeOnCardMs?: number;
  };
}

// AI-generated content
export interface Elaboration {
  userId: string;
  itemId: string;
  summary: string;
  takeaways: string[];
  whyItMatters: string;
  citations: Citation[];
  llmMeta?: {
    model: string;
    latencyMs: number;
  };
}

export interface Citation {
  title: string;
  url: string;
  outlet: string;
}

// Q&A and Drafts
export interface QnAResponse {
  userId: string;
  itemId: string;
  qaSessionId: string;
  answers: Array<{
    qId: string;
    text: string;
  }>;
}

export interface Draft {
  userId: string;
  draftId: string;
  platform: 'linkedin' | 'substack' | 'roundup';
  title: string;
  bodyMarkdown: string;
  hashtags?: string[];
  templateId?: string;
  fromItemId?: string;
  fromQnAId?: string;
  version: number;
  history?: Array<{
    version: number;
    diff: string;
    at: string;
  }>;
  status: 'draft' | 'published' | 'exported';
}

// Roundups and Scheduling
export interface Roundup {
  userId: string;
  roundupId: string;
  period: 'daily' | 'weekly' | 'monthly';
  itemIds: string[];
  generatedAt: string;
  title: string;
  bodyMarkdown: string;
}

// API Response types
export interface FeedResponse {
  items: ItemCard[];
  nextCursor?: string;
}

export interface ActionRequest {
  type: 'interesting' | 'dismiss' | 'save';
}

export interface ElaborateResponse {
  summary: string;
  takeaways: string[];
  whyItMatters: string;
  citations: Citation[];
}

export interface GenerateDraftRequest {
  platform: 'linkedin' | 'substack';
  itemId: string;
  qaSessionId?: string;
  templateId?: string;
  style?: string;
}

export interface GenerateDraftResponse {
  titleOptions: string[];
  bodyMarkdown: string;
  hashtags: string[];
}

// Preferences
export interface UserPreferences {
  userId: string;
  topics: string[];
  keywords: string[];
  regions: string[];
  includes: string[];
  excludes: string[];
  blockedSources: string[];
}

// Error types
export interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Event tracking
export interface AnalyticsEvent {
  type: string;
  userId?: string;
  timestamp: string;
  props: Record<string, unknown>;
}