export const { NODE_ENV = 'development' } = process.env
export const devMode = NODE_ENV === 'development'

if (devMode) { require('dotenv').config() }

export const {
  MONGODB_URI = 'mongodb://localhost:27017/ideastest',
  JWT_SECRET = 's,m,@@#$$%%$%%%',
  JWT_REFRESH_SECRET = '^^%&8()jhjhjssHjH123',
  JWT_ALGO = 'HS256',
  CLIENT_URL = ''
} = process.env

export const virtuals = { virtuals: true }

export const passwordMessage = 'Password (at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number)'

// tslint:disable-next-line:max-line-length
export const urlRegex = /^(?![^\n]*\.$)(?:https?:\/\/)?(?:(?:[2][1-4]\d|25[1-5]|1\d{2}|[1-9]\d|[1-9])(?:\.(?:[2][1-4]\d|25[1-5]|1\d{2}|[1-9]\d|[0-9])){3}(?::\d{4})?|[a-z\-]+(?:\.[a-z\-]+){2,})$/

export const passwordRegex = /(^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,255}$)/

export const fullNameMessage = 'Full name should be 2 to 50  characters long,  single spaced.'

export const fullNameRegex = /^(?!.* {2})[A-z]{2}[A-z\s]{1,47}[A-z]$/

export const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/

// tslint:disable-next-line:max-line-length
export const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const corsError = `No 'Access-Control-Allow-Origin' header is present on the requested resource`
