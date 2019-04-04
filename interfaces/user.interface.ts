import { Document, Types } from 'mongoose'

export interface UserProfile extends Document {
  userId: Types.ObjectId
  name: string
  avatar_url?: string
}

export interface UserEmail extends Document {
  userId: Types.ObjectId
  email: string
  primary: boolean
}

export interface UserPassword extends Document {
  userId: Types.ObjectId
  hash: string
  secret: string
  refresh_secret: string
  password?: string
  passwordConfirmation?: string
  createdAt: Date
  updatedAt: Date
  refreshTokenUpdatedAt: Date
}

export interface UserLogin {
  email: string
  password: string
  keep_logged_in: string
}

export interface UserSignup {
  email: string
  password: string
  name: string
}
