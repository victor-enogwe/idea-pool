import { Document, Types } from 'mongoose'

export interface UserProfile extends Document {
  userId: Types.ObjectId
  name: string
  avatar_url?: string
  created_at: Date
  updated_at: Date
}

export interface UserEmail extends Document {
  userId: Types.ObjectId
  email: string
  primary: boolean
  created_at: Date
  updated_at: Date
}

export interface UserPassword extends Document {
  userId: Types.ObjectId
  hash: string
  secret: string
  password?: string
  passwordConfirmation?: string
  created_at: Date
  updated_at: Date
  last_checkpoint: Date
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
