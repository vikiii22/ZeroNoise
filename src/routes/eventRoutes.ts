import { Router } from 'express';
import { getNearbyEvents } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/nearby', authenticate, getNearbyEvents);

export default router;
