import { Router } from 'express';
import { PreferencesSchema } from '@ai-news-aggregator/shared';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/preferences - Get user preferences
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: Fetch from DynamoDB
    res.json({ message: 'Get preferences - not implemented' });
  } catch (error) {
    throw error;
  }
});

// PUT /api/preferences - Update user preferences
router.put('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const preferences = PreferencesSchema.parse(req.body);
    
    // TODO: Update in DynamoDB
    res.json({ message: 'Update preferences - not implemented', preferences });
  } catch (error) {
    throw error;
  }
});

export default router;