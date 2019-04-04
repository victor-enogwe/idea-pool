import { Schema, model } from 'mongoose'
import { AuthenticationController } from '../controllers'
import { BadRequest, HttpError } from 'http-errors'
import { UserPassword } from '../interfaces'
import { JWT_SECRET, virtuals, passwordRegex } from '../utils'

const ObjectId = Schema.Types.ObjectId

const UserPasswordSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  hash: { type: String, required: [true, 'no hash supplied'] },
  active: { type: Boolean, default: false },
  refreshTokenUpdatedAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true, toJSON: virtuals, toObject: virtuals })

UserPasswordSchema.virtual('password', { type: String, required: true, minLength: 8, match: passwordRegex })
UserPasswordSchema.virtual('secret').get(accessTokenSecret)
UserPasswordSchema.virtual('refresh_secret').get(refreshTokenSecret)
UserPasswordSchema.pre<UserPassword>('validate', hashPassword)
UserPasswordSchema.pre<UserPassword>('validate', disallowPasswordUpdate)
UserPasswordSchema.pre<UserPassword>('save', makeOldPasswordsInactive)

/**
 * hash password
 *
 * @param {Function} next the next middleware
 * @returns {void}
 */
function hashPassword (this: UserPassword, next: Function): void | Promise<HttpError> {
  try {
    if (this.isNew && this.password) {
      this.hash = AuthenticationController.hashString(this.password)
    } else {
      return next(new BadRequest('password update not allowed'))
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

function accessTokenSecret (this: UserPassword) {
  return `${JWT_SECRET}.${this.userId}.${this.createdAt}.${this.updatedAt}`
}

function refreshTokenSecret (this: UserPassword) {
  return `${JWT_SECRET}.${this.userId}.${this.createdAt}.${this.refreshTokenUpdatedAt}`
}

function disallowPasswordUpdate (this: UserPassword, next: Function) {
  try {
    if (['userId', 'hash', 'createdOn'].every((field: string) => this.isModified(field))) {
      return next(new BadRequest('password update not allowed'))
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

function makeOldPasswordsInactive (this: UserPassword, next: Function) {
  try {
    if (this.isNew) {
      return model('UserPassword', UserPasswordSchema)
        .update({ userId: this.userId, active: true }, { active: false }, { multi: true })
        .then(() => next())
    }
  } catch (error) {
    return next(error)
  }
}

export default {
  name: 'UserPassword',
  schema: UserPasswordSchema
}
