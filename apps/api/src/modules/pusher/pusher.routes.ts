import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import * as pusherController from './pusher.controller';
import { pusherAuthSchema } from './pusher.validation';

export const pusherRouter = Router();

pusherRouter.post('/auth', requireAuth, validateBody(pusherAuthSchema), pusherController.auth);
