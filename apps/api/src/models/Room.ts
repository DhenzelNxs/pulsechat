import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const roomSchema = new Schema({
  type: {
    type: String,
    enum: ['dm', 'group'],
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  memberIds: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastMessageAt: {
    type: Date,
    default: () => new Date(),
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

roomSchema.index({ memberIds: 1, lastMessageAt: -1 });

export type RoomDocument = HydratedDocument<InferSchemaType<typeof roomSchema>>;

export const Room = model('Room', roomSchema);
