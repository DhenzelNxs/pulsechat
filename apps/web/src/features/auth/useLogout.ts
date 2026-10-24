import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../../api/auth';
import { setAccessToken } from '../../lib/authToken';
import { SESSION_QUERY_KEY } from './useSession';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });
}
