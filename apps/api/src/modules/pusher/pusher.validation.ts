import { z } from 'zod';

export const pusherAuthSchema = z.object({
  socket_id: z.string().min(1, 'socket_id is required'),
  channel_name: z.string().min(1, 'channel_name is required'),
});

export type PusherAuthInput = z.infer<typeof pusherAuthSchema>;
