import { Room, type RoomDocument } from '../../models/Room';
import { User } from '../../models/User';
import { AppError } from '../../errors/AppError';
import type { CreateRoomInput } from './rooms.validation';

export async function createRoom(creatorId: string, input: CreateRoomInput): Promise<RoomDocument> {
  const memberIds = Array.from(new Set([creatorId, ...input.memberIds]));

  if (input.type === 'dm' && memberIds.length !== 2) {
    throw new AppError(400, 'VALIDATION_ERROR', 'A DM must have exactly two members');
  }

  if (input.type === 'group' && memberIds.length < 2) {
    throw new AppError(400, 'VALIDATION_ERROR', 'A group must have at least two members');
  }

  const existingMemberCount = await User.countDocuments({ _id: { $in: memberIds } });

  if (existingMemberCount !== memberIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'One or more members do not exist');
  }

  return Room.create({
    type: input.type,
    name: input.type === 'group' ? input.name : undefined,
    memberIds,
    createdBy: creatorId,
  });
}

export async function listRoomsForUser(userId: string): Promise<RoomDocument[]> {
  return Room.find({ memberIds: userId }).sort({ lastMessageAt: -1 });
}

export async function getRoomForUser(userId: string, roomId: string): Promise<RoomDocument> {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError(404, 'NOT_FOUND', 'Room not found');
  }

  if (!room.memberIds.some((memberId) => memberId.toString() === userId)) {
    throw new AppError(403, 'FORBIDDEN', 'You are not a member of this room');
  }

  return room;
}
