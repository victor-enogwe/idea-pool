export const { NODE_ENV = 'development' } = process.env
export const isDevMode = NODE_ENV === 'development'

if (isDevMode) { require('dotenv').config() }

export const { MONGODB_URI = 'mongodb://localhost:27017/ideas', JWT_SECRET, ALLOWED_ORIGINS = '', CLIENT_URL } = process.env

export const isTestMode = NODE_ENV === 'test'

export const virtuals = { virtuals: true }

export const passwordMessage = 'password must have a mimimum of eight characters, at least one letter, one number and one special character'
