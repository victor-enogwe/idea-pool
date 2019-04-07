import { ValidationParamSchema } from 'express-validator/check'
import { passwordMessage, passwordRegex, fullNameMessage, fullNameRegex, jwtRegex } from './constants.util'

const sanitize: ValidationParamSchema = {
  in: ['body'],
  trim: true,
  escape: true
}

export const email: ValidationParamSchema = {
  ...sanitize,
  isEmail: { errorMessage: 'please supply a valid email address' },
  normalizeEmail: { options: [{ all_lowercase: true, gmail_remove_dots: false }] }
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

export const content: ValidationParamSchema = {
  ...sanitize,
  isLength: { errorMessage: '', options: { min: 10, max: 255 } }
}

export const page: ValidationParamSchema = {
  ...sanitize,
  in: ['query'],
  isNumeric: { errorMessage: 'Pagination requires a numeric value greater than  1', options: { min: 1 } }
}

export const impact: ValidationParamSchema = {
  ...sanitize,
  isNumeric: { errorMessage: 'Please enter a number between 1 and 10', options: { min: 1, max: 10 } }
}

export const ease: ValidationParamSchema = {
  ...impact
}

export const confidence: ValidationParamSchema = {
  ...impact
}

export const id: ValidationParamSchema = {
  ...sanitize,
  in: ['params'],
  errorMessage: 'Please supply a valid id',
  isMongoId: true
}
