import { Schema } from 'mongoose'
import { virtuals, fullNameRegex } from '../utils'

const ObjectId = Schema.Types.ObjectId

const UserProfileSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, match: fullNameRegex }
}, { timestamps: true, toJSON: virtuals, toObject: virtuals })

export default {
  name: 'UserProfile',
  schema: UserProfileSchema
}
