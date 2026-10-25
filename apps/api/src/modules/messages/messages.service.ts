import { parseMentionCandidates } from '@pulsechat/shared';
import { Message, type MessageDocument } from '../../models/Message';
import { User } from '../../models/User';
import { pusher } from '../../config/pusher';
import { logger } from '../../config/logger';
import { getRoomForUser } from '../rooms/rooms.service';
import type { ListMessagesQuery } from './messages.validation';

const SEARCH_RESULT_LIMIT = 50;

export interface MessagePage {
  messages: MessageDocument[];
  nextCursor: string | null;
}

export async function listMessages(
  userId: string,
  roomId: string,
  { cursor, limit }: ListMessagesQuery,
): Promise<MessagePage> {
  await getRoomForUser(userId, roomId);

  const messages = await Message.find({
    roomId,
    ...(cursor ? { createdAt: { $lt: new Date(cursor) } } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  const nextCursor =
    messages.length === limit ? messages[messages.length - 1]!.createdAt.toISOString() : null;

  return { messages, nextCursor };
}

async function resolveMentions(content: string, memberIds: string[]): Promise<string[]> {
  const candidates = parseMentionCandidates(content);
  if (candidates.length === 0) {
    return [];
  }

  const lowerCandidates = new Set(candidates.map((candidate) => candidate.toLowerCase()));
  const members = await User.find({ _id: { $in: memberIds } }, { username: 1 });

  return members
    .filter((member) => lowerCandidates.has(member.username.toLowerCase()))
    .map((member) => member._id.toString());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function sendMessage(
  userId: string,
  roomId: string,
  content: string,
): Promise<MessageDocument> {
  const room = await getRoomForUser(userId, roomId);
  const mentions = await resolveMentions(
    content,
    room.memberIds.map((memberId) => memberId.toString()),
  );

  const message = await Message.create({
    roomId,
    senderId: userId,
    content,
    mentions,
  });

  room.lastMessageAt = message.createdAt;
  await room.save();

  try {
    await pusher.trigger(`private-room-${roomId}`, 'message:new', message.toJSON());
  } catch (error) {
    logger.error({ err: error, roomId }, 'Failed to publish message:new to Pusher');
  }

  try {
    const memberChannels = room.memberIds.map((memberId) => `private-user-${memberId.toString()}`);
    await pusher.trigger(memberChannels, 'room:updated', { roomId });
  } catch (error) {
    logger.error({ err: error, roomId }, 'Failed to publish room:updated to Pusher');
  }

  return message;
}

export async function searchMessages(
  userId: string,
  roomId: string,
  query: string,
): Promise<MessageDocument[]> {
  await getRoomForUser(userId, roomId);

  const pattern = new RegExp(escapeRegExp(query), 'i');

  return Message.find({ roomId, content: pattern })
    .sort({ createdAt: -1 })
    .limit(SEARCH_RESULT_LIMIT);
}
