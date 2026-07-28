import { Router } from 'express';
import { createEvent, getNearbyEvents, getAllEvents } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createEvent);
router.get('/nearby', authenticate, getNearbyEvents);
router.get('/all', authenticate, getAllEvents);

export default router;
