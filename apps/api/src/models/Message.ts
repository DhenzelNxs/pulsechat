import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const messageSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000,
  },
  mentions: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  readBy: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  editedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

messageSchema.index({ roomId: 1, createdAt: -1 });

export type MessageDocument = HydratedDocument<InferSchemaType<typeof messageSchema>>;

export const Message = model('Message', messageSchema);
