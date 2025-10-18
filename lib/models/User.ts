import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  id: string
  email: string
  name?: string
  username?: string
  image?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date

  // Game Statistics
  gamesPlayed: number
  gamesWon: number
  totalTreasure: number
  dragonsKilled: number
  totalPlayTime: number
  highestStreak: number

  // Progression
  accountLevel: number
  accountXP: number
  prestigePoints: number

  // Settings & Preferences
  preferences?: Record<string, any>
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  image: String,
  emailVerified: Date,
  lastLogin: Date,

  // Game Statistics
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  gamesWon: {
    type: Number,
    default: 0,
  },
  totalTreasure: {
    type: Number,
    default: 0,
  },
  dragonsKilled: {
    type: Number,
    default: 0,
  },
  totalPlayTime: {
    type: Number,
    default: 0,
  },
  highestStreak: {
    type: Number,
    default: 0,
  },

  // Progression
  accountLevel: {
    type: Number,
    default: 1,
  },
  accountXP: {
    type: Number,
    default: 0,
  },
  prestigePoints: {
    type: Number,
    default: 0,
  },

  // Settings & Preferences
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
