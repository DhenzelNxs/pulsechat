import { useMutation } from '@tanstack/react-query';
import type { RegisterInput } from '@pulsechat/shared';
import { register } from '../../api/auth';

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  });
}
