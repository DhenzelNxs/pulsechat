import { User, type UserDocument } from '../../models/User';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchUsers(currentUserId: string, query: string): Promise<UserDocument[]> {
  const pattern = new RegExp(escapeRegExp(query), 'i');

  return User.find({
    _id: { $ne: currentUserId },
    username: pattern,
  }).limit(10);
}
