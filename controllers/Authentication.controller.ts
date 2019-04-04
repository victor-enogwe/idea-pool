import { sign, verify, decode } from 'jsonwebtoken'
import { Unauthorized } from 'http-errors'
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { Types, model } from 'mongoose'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { UserLogin, UserSignup, UserPassword } from '../interfaces'
import { CLIENT_URL, JWT_ALGO } from '../utils'

declare global {
  namespace Express {
    export interface Request {
      decoded: {
        userId: Types.ObjectId
      }
    }
  }
}

interface GenerateAuth {
  userId: Types.ObjectId
  hash?: string
  password?: string
  secret: string
  refresh_secret?: string
  refreshTokenExpiresIn?: string
}

export interface GeneratedAuth { jwt: string, refresh_token?: string }

interface GenerateToken {
  secret: string
  userInfo: {
    userId: Types.ObjectId,
    token_type: 'x-access-token' | 'x-refresh-token'
  }
  expiresIn?: string
}

export interface Decoded {
  userId?: string
  token_type: 'x-access-token' | 'x-refresh-token'
  iat?: string
  exp?: string
  aud?: string
  iss?: string
}

export class AuthenticationController {
  /**
   * generate Token
   *
   * @static
   * @param {string} params.secret the jwt secret
   * @param {Types.ObjectId} params.userInfo.id the user Id
   * @returns {string} the jwt token
   * @memberof AuthenticationController
   */
  static generateToken ({ secret, userInfo, expiresIn = '10m' }: GenerateToken): string {
    return sign(userInfo, secret, { expiresIn, audience: CLIENT_URL, issuer: CLIENT_URL, algorithm: JWT_ALGO })
  }

  /**
   * Checks if a token is valid
   * @static
   * @param {string} params.token the request object
   * @param {string} params.secret the jwt secret
   * @returns {Object} the decoded token
   * @memberof AuthenticationController
   */
  static verifyToken ({ token, secret }: { token: string, secret: string }): any {
    return verify(token, secret)
  }

  /**
   * Hash String
   *
   * @static
   * @param {string} value
   * @returns {string} the hashed string
   * @memberof AuthenticationController
   */
  static hashString (value: string): string {
    const salt = genSaltSync(10)

    return hashSync(value, salt)
  }

  /**
   * Compare hash with original string
   *
   * @static
   * @param {string} params.has hashed value
   * @param {string} params.comparison original string
   * @returns {boolean} matched
   * @memberof AuthenticationController
   */
  static compareHash ({ hash, comparison }: { hash: string, comparison: string }): boolean {
    return compareSync(comparison, hash)
  }

  /**
   * GenerateAuthToken
   *
   * @static
   * @param {UserLogin} login useremail and password
   * @returns {string} the authorization token
   * @memberof AuthenticationController
   */
  static generateAuthToken (generateAuthArgs: GenerateAuth): GeneratedAuth {
    try {
      const { userId, hash, password, secret, refreshTokenExpiresIn = '7d', refresh_secret } = generateAuthArgs
      if (hash && password && !AuthenticationController.compareHash({ hash, comparison: password })) {
        throw new Unauthorized('invalid password')
      }

      const tokens: GeneratedAuth = {
        jwt: AuthenticationController.generateToken({ secret, userInfo: { userId, token_type: 'x-access-token' } })
      }

      if (refresh_secret) {
        tokens.refresh_token = AuthenticationController.generateToken({
          secret: refresh_secret,
          userInfo: { userId, token_type: 'x-refresh-token' },
          expiresIn: refreshTokenExpiresIn
        })
      }

      return tokens
    } catch (error) {
      throw new Unauthorized(`unauthorized access! ${error.message}`)
    }
  }

  /**
   * Decode Token
   *
   * @static
   * @param {{ token: string }} { token }
   * @memberof AuthenticationController
   */
  static decodeToken ({ token }: { token: string }): Decoded {
    return (decode(token, { json: true }) as Decoded)
  }

  static async decodeAccessTokenMiddleware (req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.get('x-access-token') || ''
      const decoded = AuthenticationController.decodeToken({ token })
      const { secret }: any = await model('UserPassword').findOne({ userId: decoded.userId, active: true }).exec()
      req.decoded = AuthenticationController.verifyToken({ token, secret })

      return next()
    } catch (error) {
      return next(error)
    }
  }

  static async decodeRefreshTokenMiddleware (req: Request, res: Response, next: NextFunction) {
    try {
      const decoded = AuthenticationController.decodeToken({ token: req.body.refresh_token })
      const { refresh_secret }: any = await model('UserPassword').findOne({ userId: decoded.userId, active: true }).exec()
      req.decoded = AuthenticationController.verifyToken({ token: req.body.refresh_token, secret: refresh_secret })

      return next()
    } catch (error) {
      return next(error)
    }
  }

  static async login (req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, keep_logged_in }: UserLogin = req.body
      const { userId }: any = await model('UserEmail').findOne({ email }).exec()
      // we invalidate the old refresh and access token here on login
      const { hash, secret, refresh_secret }: any = await model('UserPassword').findOneAndUpdate(
        { userId, active: true }, { updatedAt: Date.now(), refreshTokenUpdatedAt: Date.now() }, { new: true }
      ).exec()
      const tokens = AuthenticationController.generateAuthToken({
        userId, hash, secret, password, refreshTokenExpiresIn: keep_logged_in, refresh_secret
      })

      return res.status(201).json(tokens)
    } catch (error) {
      return next(error)
    }
  }

  static async refreshAccessToken (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.decoded.userId
      const { secret }: any = await model('UserPassword').findOne({ userId, active: true }).exec()
      const { jwt } = AuthenticationController.generateAuthToken({ userId, secret })

      return res.status(200).json({ jwt })
    } catch (error) {
      return next(error)
    }
  }

  static invalidateAccessToken (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.decoded.userId
      const update: { updatedAt?: Date | number } = { updatedAt: Date.now() }

      return model('UserPassword').findOneAndUpdate({ userId, active: true }, update).then(() => next())
    } catch (error) {
      return next(error)
    }
  }

  static async logout (req: Request, res: Response, next: NextFunction) {
    return model('UserPassword').findOneAndUpdate(
      { userId: req.decoded.userId, active: true }, { updatedAt: Date.now(), refreshTokenUpdatedAt: Date.now() }
    ).exec().then(() => res.status(204).json({ refresh_token: req.body.refresh_token })).catch(error => next(error))
  }

  static async signup (req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name }: UserSignup = req.body
      const userId = Types.ObjectId()
      await model('UserEmail').insertMany([{ userId, email, primary: true }])
      await model('UserProfile').insertMany([{ userId, name }])
      await model('User').insertMany([{ _id: userId }])
      const [{ hash, secret, refresh_secret }] = await model('UserPassword')
        .insertMany([{ userId: userId, password, active: true }]) as [UserPassword]
      const tokens = AuthenticationController.generateAuthToken({ userId, hash, secret, password, refresh_secret })

      return res.status(201).json(tokens)
    } catch (error) {
      return next(error)
    }
  }
}
