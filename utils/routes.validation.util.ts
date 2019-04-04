import { ValidationParamSchema } from 'express-validator/check'
import { passwordMessage, passwordRegex, fullNameMessage, fullNameRegex, jwtRegex } from './constants.util'

const sanitize: ValidationParamSchema = {
  in: ['body'],
  trim: true,
  escape: true,
  stripLow: true
}

export const email: ValidationParamSchema = {
  ...sanitize,
  isEmail: { errorMessage: 'please supply a valid email address' },
  normalizeEmail: { options: [{ all_lowercase: true }] }
}

export const name: ValidationParamSchema = {
  matches: { errorMessage: fullNameMessage, options: fullNameRegex },
  ...sanitize
}

export const password: ValidationParamSchema = {
  matches: { options: passwordRegex, errorMessage: passwordMessage },
  ...sanitize
}

export const token: ValidationParamSchema = {
  ...sanitize,
  in: ['headers'],
  matches: { errorMessage: 'please supply a valid json web token', options: jwtRegex }
}
