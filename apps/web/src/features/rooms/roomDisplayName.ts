import type { Room } from '../../api/rooms';
import { displayName } from '../../lib/displayName';

export function roomDisplayName(room: Room, currentUserId: string | undefined): string {
  if (room.type === 'group') {
    return room.name ?? 'Group chat';
  }

  const other = room.memberIds.find((member) => member._id !== currentUserId);
  return other ? displayName(other) : 'Direct message';
}
