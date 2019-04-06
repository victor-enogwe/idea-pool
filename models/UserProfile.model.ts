import { model, Schema } from 'mongoose'
import { fullNameRegex, modelOptions } from '../utils'
import { UserProfile } from '../interfaces'

const ObjectId = Schema.Types.ObjectId

const UserProfileSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, match: fullNameRegex }
}, modelOptions)

model<UserProfile>('UserProfile', UserProfileSchema)
