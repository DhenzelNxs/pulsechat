import type { Room, RoomMember } from '../../api/rooms';
import { displayName } from '../../lib/displayName';

export function otherRoomMember(room: Room, currentUserId: string | undefined): RoomMember | undefined {
  if (room.type !== 'dm') {
    return undefined;
  }

  return room.memberIds.find((member) => member._id !== currentUserId);
}

export function roomDisplayName(room: Room, currentUserId: string | undefined): string {
  if (room.type === 'group') {
    return room.name ?? 'Group chat';
  }

  const other = otherRoomMember(room, currentUserId);
  return other ? displayName(other) : 'Direct message';
}
