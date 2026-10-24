import type Pusher from 'pusher';
import { pusher } from '../../config/pusher';
import { AppError } from '../../errors/AppError';
import { User } from '../../models/User';
import { getRoomForUser } from '../rooms/rooms.service';
import type { PusherAuthInput } from './pusher.validation';

export async function authorizeChannel(
  userId: string,
  { socket_id, channel_name }: PusherAuthInput,
): Promise<Pusher.ChannelAuthResponse> {
  if (channel_name.startsWith('presence-room-')) {
    const roomId = channel_name.slice('presence-room-'.length);
    await getRoomForUser(userId, roomId);

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(403, 'FORBIDDEN', 'User not found');
    }

    return pusher.authorizeChannel(socket_id, channel_name, {
      user_id: userId,
      user_info: { username: user.username, avatarUrl: user.avatarUrl },
    });
  }

  if (channel_name.startsWith('private-room-')) {
    const roomId = channel_name.slice('private-room-'.length);
    await getRoomForUser(userId, roomId);
    return pusher.authorizeChannel(socket_id, channel_name);
  }

  if (channel_name.startsWith('private-user-')) {
    const targetUserId = channel_name.slice('private-user-'.length);
    if (targetUserId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You may only subscribe to your own user channel');
    }

    return pusher.authorizeChannel(socket_id, channel_name);
  }

  throw new AppError(400, 'VALIDATION_ERROR', 'Unrecognized channel');
}
