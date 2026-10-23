import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  avatarUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline',
  },
  lastSeenAt: {
    type: Date,
    default: () => new Date(),
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  refreshTokenHash: {
    type: String,
    select: false,
  },
});

userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.__v;
    return ret;
  },
});

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model('User', userSchema);
