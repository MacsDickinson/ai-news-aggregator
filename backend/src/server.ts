import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { EnvSchema } from '@ai-news-aggregator/shared';

// Import routes
import feedRoutes from './routes/feed';
import itemRoutes from './routes/item';
import draftsRoutes from './routes/drafts';
import preferencesRoutes from './routes/preferences';
import sourcesRoutes from './routes/sources';
import roundupsRoutes from './routes/roundups';
import scheduleRoutes from './routes/schedule';
import eventsRoutes from './routes/events';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

// Validate environment variables
const env = EnvSchema.parse(process.env);

const app = express();
const PORT = env.PORT;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

// API routes
app.use('/api/feed', feedRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/preferences', authMiddleware, preferencesRoutes);
app.use('/api/sources', authMiddleware, sourcesRoutes);
app.use('/api/roundups', authMiddleware, roundupsRoutes);
app.use('/api/schedule', authMiddleware, scheduleRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Environment: ${env.NODE_ENV}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;