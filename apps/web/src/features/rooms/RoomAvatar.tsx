import Avatar from '@mui/material/Avatar';
import GroupIcon from '@mui/icons-material/Group';
import type { Room } from '../../api/rooms';
import { initials } from '../../lib/displayName';
import { otherRoomMember } from './roomDisplayName';

interface RoomAvatarProps {
  room: Room;
  currentUserId: string | undefined;
  size?: number;
}

export function RoomAvatar({ room, currentUserId, size = 36 }: RoomAvatarProps) {
  if (room.type === 'group') {
    return (
      <Avatar sx={{ width: size, height: size, bgcolor: 'secondary.main' }}>
        <GroupIcon sx={{ fontSize: size * 0.55 }} />
      </Avatar>
    );
  }

  const other = otherRoomMember(room, currentUserId);

  return (
    <Avatar sx={{ width: size, height: size, fontSize: size * 0.35 }}>{other ? initials(other) : '?'}</Avatar>
  );
}
