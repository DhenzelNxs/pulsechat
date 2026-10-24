interface NamedUser {
  firstName?: string;
  lastName?: string;
  username: string;
}

export function displayName(user: NamedUser): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username;
}
