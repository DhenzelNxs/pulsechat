import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody, validateQuery } from '../../middleware/validate';
import * as roomsController from './rooms.controller';
import * as messagesController from '../messages/messages.controller';
import { createRoomSchema } from './rooms.validation';
import {
  listMessagesQuerySchema,
  searchMessagesQuerySchema,
  sendMessageSchema,
} from '../messages/messages.validation';

export const roomsRouter = Router();

roomsRouter.use(requireAuth);

roomsRouter.post('/', validateBody(createRoomSchema), roomsController.create);
roomsRouter.get('/', roomsController.list);
roomsRouter.get('/:id', roomsController.getById);
roomsRouter.post('/:id/read', roomsController.markRead);
roomsRouter.get('/:id/messages', validateQuery(listMessagesQuerySchema), messagesController.list);
roomsRouter.get(
  '/:id/messages/search',
  validateQuery(searchMessagesQuerySchema),
  messagesController.search,
);
roomsRouter.post('/:id/messages', validateBody(sendMessageSchema), messagesController.send);
