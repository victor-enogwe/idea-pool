import { Schema, model } from 'mongoose'
import { UserEmail } from '../interfaces'
import { emailRegex } from '../utils'

const ObjectId = Schema.Types.ObjectId

const UserEmailSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  email: { type: String, required: [true, 'valid email required'], match: emailRegex, unique: true, index: true },
  primary: { type: Boolean, default: false }
}, { timestamps: true })

UserEmailSchema.pre('save', newPrimaryEmail)

function newPrimaryEmail (this: UserEmail, next: Function) {
  try {
    if (this.primary === true) {
      return model('UserEmail', UserEmailSchema)
        .update({ userId: this.userId, email: this.email, primary: true }, { primary: false }, { multi: true })
        .then(() => next())
    }
  } catch (error) {
    return next(error)
  }
}

export default {
  name: 'UserEmail',
  schema: UserEmailSchema
}
