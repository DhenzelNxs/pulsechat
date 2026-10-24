import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginInput } from '@pulsechat/shared';
import { login } from '../../api/auth';
import { setAccessToken } from '../../lib/authToken';
import { SESSION_QUERY_KEY } from './useSession';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: ({ user, accessToken }) => {
      setAccessToken(accessToken);
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
  });
}
