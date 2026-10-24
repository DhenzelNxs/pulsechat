import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser, refreshAccessToken, type User } from '../../api/auth';
import { setAccessToken } from '../../lib/authToken';

export const SESSION_QUERY_KEY = ['session'];

async function loadSession(): Promise<User | null> {
  try {
    const { accessToken } = await refreshAccessToken();
    setAccessToken(accessToken);
  } catch {
    setAccessToken(null);
    return null;
  }

  try {
    const { user } = await fetchCurrentUser();
    return user;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: loadSession,
    staleTime: Infinity,
    retry: false,
  });
}
