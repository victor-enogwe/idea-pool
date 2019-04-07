import { Schema, model } from 'mongoose'
import { UserEmail } from '../interfaces'
import { emailRegex, modelOptions } from '../utils'

const ObjectId = Schema.Types.ObjectId

const UserEmailSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  email: { type: String, required: [true, 'valid email required'], match: emailRegex, unique: true, index: true },
  primary: { type: Boolean, default: false }
}, modelOptions)

model<UserEmail>('UserEmail', UserEmailSchema)
