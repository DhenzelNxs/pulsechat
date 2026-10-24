import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import * as roomsService from './rooms.service';
import type { CreateRoomInput } from './rooms.validation';

export async function create(req: AuthenticatedRequest & { body: CreateRoomInput }, res: Response) {
  const room = await roomsService.createRoom(req.userId as string, req.body);
  res.status(201).json({ room });
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const rooms = await roomsService.listRoomsForUser(req.userId as string);
  res.status(200).json({ rooms });
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  const room = await roomsService.getRoomForUser(req.userId as string, req.params.id as string);
  res.status(200).json({ room });
}
