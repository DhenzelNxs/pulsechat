import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import type { ValidatedQueryRequest } from '../../middleware/validate';
import * as messagesService from './messages.service';
import type { ListMessagesQuery, SendMessageInput } from './messages.validation';

export async function list(
  req: AuthenticatedRequest & ValidatedQueryRequest<ListMessagesQuery>,
  res: Response,
) {
  const page = await messagesService.listMessages(
    req.userId as string,
    req.params.id as string,
    req.validatedQuery as ListMessagesQuery,
  );
  res.status(200).json(page);
}

export async function send(req: AuthenticatedRequest & { body: SendMessageInput }, res: Response) {
  const message = await messagesService.sendMessage(
    req.userId as string,
    req.params.id as string,
    req.body.content,
  );
  res.status(201).json({ message });
}
