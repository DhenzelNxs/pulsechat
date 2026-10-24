import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content is required').max(10000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const listMessagesQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;

export const searchMessagesQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(200),
});

export type SearchMessagesQuery = z.infer<typeof searchMessagesQuerySchema>;
