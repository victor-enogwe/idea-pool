import { sign, verify, decode } from 'jsonwebtoken'
import { Unauthorized } from 'http-errors'
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { Types, model } from 'mongoose'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { CLIENT_URL, JWT_ALGO, JWT_SECRET, JWT_REFRESH_SECRET } from '../../utils'
import {
  UserLogin,
  UserSignup,
  UserPassword,
  GenerateToken,
  Decoded,
  UserEmail,
  UserProfile
} from '../../interfaces'

export class AuthenticationController {

  /**
   * Checks if a token is valid
   * @static
   * @param {string} params.token the request object
   * @param {string} params.secret the jwt secret
   * @returns {Object} the decoded token
   * @memberof AuthenticationController
   */
  static verifyToken ({ token, secret }: { token: string, secret: string }): Decoded | any {
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
   * Decode Token
   *
   * @static
   * @param {{ token: string }} { token }
   * @memberof AuthenticationController
   */
  static decodeToken ({ token }: { token: string }): Decoded {
    return (decode(token, { json: true }) as Decoded)
  }

  /**
   *  Verify Token Middleware
   *
   * @static
   * @param {Request} req the http request object
   * @param {Response} res the http response object
   * @param {NextFunction} next the next middleware function
   * @returns {Promise<any>} the next middleware function
   * @memberof AuthenticationController
   */
  static async verifyTokenMiddleware (req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const logout = req.originalUrl === '/access-tokens' && req.method === 'DELETE'
      const refresh = req.path === '/refresh'
      const token = logout || refresh ? req.body.refresh_token : req.get('x-access-token')

      const { userId } = AuthenticationController.decodeToken({ token })
      const pass = await model<UserPassword>('UserPassword').findOne({ userId, active: true }).exec()
      if (!pass) { throw new Unauthorized('invalid credentials') }
      const secret = logout || refresh ? `${JWT_REFRESH_SECRET}-${pass.last_checkpoint}` : `${JWT_SECRET}-${pass.updated_at}`

      req.decoded = AuthenticationController.verifyToken({ token, secret })

      return next()
    } catch (error) {
      return next(error)
    }
  }

  /**
   * User Login
   *
   * @static
   * @param {Request} req the http request object
   * @param {Response} res the http response object
   * @param {NextFunction} next the next middleware function
   * @returns {Promise<any>} the next middleware function
   * @memberof AuthenticationController
   */
  static async login (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password, keep_logged_in }: UserLogin = req.body
      const user = await model<UserEmail>('UserEmail').findOne({ email }).exec()

      if (!user) { throw new Unauthorized('invalid credentials') }

      // we invalidate the old refresh and access token here on login
      const pass = await model<UserPassword>('UserPassword')
        .findOneAndUpdate(
          { userId: user.userId, active: true }, { last_checkpoint: new Date(), updated_at: new Date() }, { new: true }
        ).exec()

      if (!pass) { throw new Unauthorized('invalid credentials') }

      const { hash, last_checkpoint, updated_at } = pass

      if (!AuthenticationController.compareHash({ hash, comparison: password })) { throw new Unauthorized('invalid credentials') }
      const config = ({ type, secret }: any) => ({ userInfo: { userId: user.userId, token_type: type }, secret, expiresIn: keep_logged_in })
      const jwtSecret = `${JWT_SECRET}-${updated_at}`
      const refreshSecret = `${JWT_REFRESH_SECRET}-${last_checkpoint}`
      const jwt = AuthenticationController.generateToken(config({ type: 'x-access-token', secret: jwtSecret }))
      const refresh_token = AuthenticationController.generateToken(config({
        type: 'x-refresh-token', secret: refreshSecret, expiresIn: '7d'
      }))

      return res.status(201).json({ jwt, refresh_token })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Refresh Access Token
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<any>}
   * @memberof AuthenticationController
   */
  static async refreshAccessToken (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.decoded.userId
      const projections = { new: true , projection: { secret: 1, _id: 0, userId: 1, updated_at: 1 } }
      const update = { updated_at: new Date() }
      const updated = await model<UserPassword>('UserPassword').findOneAndUpdate({ userId, active: true }, update, projections).exec()
      if (!updated) { throw new Unauthorized('invalid credentials') }
      const secret = `${JWT_SECRET}-${updated.updated_at}`
      const jwt = AuthenticationController.generateToken({ userInfo: { userId }, secret })
      return res.status(200).json({ jwt })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Logout User
   * invalidate existing tokens
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof AuthenticationController
   */
  static async logout (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return model<UserPassword>('UserPassword').findOneAndUpdate({ userId: req.decoded.userId, active: true }, { updated_at: new Date() })
      .exec().then(() => res.status(204).json(null)).catch(error => next(error))
  }

  /**
   * Signup Users
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof AuthenticationController
   */
  static async signup (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password, name }: UserSignup = req.body
      const userId = Types.ObjectId()
      await model<UserEmail>('UserEmail').insertMany([{ userId, email, primary: true }])
      await model<UserProfile>('UserProfile').insertMany([{ userId, name }])
      await model('User').insertMany([{ _id: userId }])
      const [{ last_checkpoint, updated_at }] = await model<UserPassword>('UserPassword').insertMany(
        [{ userId: userId, password, active: true }]
      )
      const jwtSecret = `${JWT_SECRET}-${updated_at}`
      const refreshSecret = `${JWT_REFRESH_SECRET}-${last_checkpoint}`
      const tokens = {
        jwt: AuthenticationController.generateToken({ userInfo: { userId }, secret: jwtSecret }),
        refresh_token: AuthenticationController.generateToken({ userInfo: { userId }, secret: refreshSecret, expiresIn: '7d' })
      }

      return res.status(201).json(tokens)
    } catch (error) {
      return next(error)
    }
  }
}
