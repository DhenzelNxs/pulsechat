interface NamedUser {
  firstName?: string;
  lastName?: string;
  username: string;
}

export function displayName(user: NamedUser): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username;
}

export function initials(user: NamedUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase();
  }

  return user.username.slice(0, 2).toUpperCase();
}
