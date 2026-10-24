import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateQuery } from '../../middleware/validate';
import * as usersController from './users.controller';
import { searchUsersQuerySchema } from './users.validation';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/search', validateQuery(searchUsersQuerySchema), usersController.search);
