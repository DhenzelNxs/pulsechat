import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

export const authRouter = Router();

authRouter.use(authRateLimiter);

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.me);
