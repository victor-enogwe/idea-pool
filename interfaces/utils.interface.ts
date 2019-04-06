import { Types } from 'mongoose'

export interface GeneratedAuth {
  jwt: string
  refresh_token?: string
}

export interface GenerateToken {
  secret: string
  userInfo: {
    userId: Types.ObjectId
  }
  expiresIn?: string
}

export interface Decoded {
  userId?: Types.ObjectId
  refresh_hash: string
  iat?: string
  exp?: string
  aud?: string
  iss?: string
}

declare global {
  namespace Express {
    export interface Request {
      decoded: {
        userId: Types.ObjectId
        auth?: {
          secret: string
        }
      }
    }
  }
}
