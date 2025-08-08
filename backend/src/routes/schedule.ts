import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/schedule - Set up recurring roundup schedule
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: Create EventBridge rule for user
    res.json({ message: 'Schedule roundup - not implemented' });
  } catch (error) {
    throw error;
  }
});

// GET /api/schedule - Get user's schedule
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: Fetch user's schedule
    res.json({ message: 'Get schedule - not implemented' });
  } catch (error) {
    throw error;
  }
});

export default router;