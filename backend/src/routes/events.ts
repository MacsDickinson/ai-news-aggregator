import { Router } from 'express';
import { AnalyticsEventSchema } from '@ai-news-aggregator/shared';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/events - Track analytics events
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    // Validate each event
    const validatedEvents = events.map(event => AnalyticsEventSchema.parse(event));
    
    // TODO: Send to Kinesis Firehose
    
    res.json({ 
      message: 'Events tracked', 
      count: validatedEvents.length 
    });
  } catch (error) {
    throw error;
  }
});

export default router;