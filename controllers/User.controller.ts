import { createHash } from 'crypto'
import { model } from 'mongoose'
import { NotFound } from 'http-errors'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { emailRegex } from '../utils'

export class UserController {

  /**
   *  Get User Profile
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof UserController
   */
  static async me (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.decoded.userId
      const [{ email }, { name }]: any = await Promise.all([
        model('UserEmail').findOne({ primary: true, userId }),
        model('UserProfile').findOne({ userId })
      ])

      if (!email) { throw new NotFound('user not found') }

      const avatar_url = UserController.gravatarUrl({ hash: UserController.makeGravatarHash({ email }) })

      return res.status(200).json({ email, name, avatar_url })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Create Gravatar URL Has
   *
   * @static
   * @param {{ email: string }} { email }
   * @returns {string}
   * @memberof UserController
   */
  static makeGravatarHash ({ email }: { email: string }): string {
    if (!emailRegex.test(email)) { throw new RangeError('valid email required') }
    return createHash('md5').update(email.toLowerCase().trim()).digest('hex')
  }

  /**
   * Gravatar Url
   *
   * @static
   * @param {{ hash: string }} { hash }
   * @returns {string}
   * @memberof UserController
   */
  static gravatarUrl ({ hash }: { hash: string }): string {
    return `https://www.gravatar.com/avatar/${hash}?d=mm&s=200`
  }
}
