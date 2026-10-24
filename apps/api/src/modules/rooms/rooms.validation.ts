import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine(mongoose.isValidObjectId, 'Invalid id');

export const createRoomSchema = z
  .object({
    type: z.enum(['dm', 'group']),
    name: z.string().trim().min(1).max(100).optional(),
    memberIds: z.array(objectIdSchema).min(1, 'At least one other member is required'),
  })
  .refine((data) => data.type !== 'group' || Boolean(data.name), {
    message: 'Group rooms require a name',
    path: ['name'],
  });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
