import { Schema, model, Types } from 'mongoose'
import { AuthenticationController } from '../controllers/v0'
import { UnprocessableEntity } from 'http-errors'
import { UserPassword } from '../interfaces'
import { passwordRegex, modelOptions, passwordMessage } from '../utils'

const ObjectId = Types.ObjectId

const UserPasswordSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  hash: { type: String, required: [true, passwordMessage] },
  active: { type: Boolean, default: false },
  last_checkpoint: { type: Date, required: true, default: Date.now }
}, modelOptions)

UserPasswordSchema.virtual('password')
UserPasswordSchema.pre<UserPassword>('validate', hashPassword)

/**
 * hash password
 *
 * @param {Function} next the next middleware
 * @returns {void}
 */
function hashPassword (this: UserPassword, next: Function): void {
  try {
    if (!this.password || !(this.password && passwordRegex.test(this.password))) { throw new UnprocessableEntity(passwordMessage) }
    if (this.isNew) { this.hash = AuthenticationController.hashString(this.password) }

    return next()
  } catch (error) {
    return next(error)
  }
}

model<UserPassword>('UserPassword', UserPasswordSchema)
