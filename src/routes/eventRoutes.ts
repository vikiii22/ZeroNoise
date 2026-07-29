import { Router } from 'express';
import { createEvent, getNearbyEvents, getAllEvents, updateEvent, deleteEvent, joinEvent, leaveEvent, getMyEvents } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createEvent);
router.get('/nearby', authenticate, getNearbyEvents);
router.get('/all', authenticate, getAllEvents);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/join', authenticate, joinEvent);
router.post('/:id/leave', authenticate, leaveEvent);
router.get('/my', authenticate, getMyEvents);

export default router;
