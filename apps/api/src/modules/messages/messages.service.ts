import { Message, type MessageDocument } from '../../models/Message';
import { getRoomForUser } from '../rooms/rooms.service';
import type { ListMessagesQuery } from './messages.validation';

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

export async function sendMessage(
  userId: string,
  roomId: string,
  content: string,
): Promise<MessageDocument> {
  const room = await getRoomForUser(userId, roomId);

  const message = await Message.create({
    roomId,
    senderId: userId,
    content,
  });

  room.lastMessageAt = message.createdAt;
  await room.save();

  return message;
}
