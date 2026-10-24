import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import * as pusherService from './pusher.service';
import type { PusherAuthInput } from './pusher.validation';

export async function auth(req: AuthenticatedRequest & { body: PusherAuthInput }, res: Response) {
  const result = await pusherService.authorizeChannel(req.userId as string, req.body);
  res.status(200).json(result);
}
