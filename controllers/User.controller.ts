import { createHash } from 'crypto'
import { model } from 'mongoose'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { emailRegex } from '../utils'

export class UserController {
  static async me (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.decoded.userId
      const [{ email }, { name }]: any = await Promise.all([
        model('UserEmail').findOne({ primary: true, userId }),
        model('UserProfile').findOne({ userId })
      ])
      const avatar_url = UserController.gravatarUrl({ hash: UserController.makeGravatarHash({ email }) })

      return res.status(200).json({ email, name, avatar_url })
    } catch (error) {
      return next(error)
    }
  }

  static makeGravatarHash ({ email }: { email: string }): string {
    if (!emailRegex.test(email)) { throw new RangeError('valid email required') }
    return createHash('md5').update(email.toLowerCase().trim()).digest('hex')
  }

  static gravatarUrl ({ hash }: { hash: string }): string {
    return `https://www.gravatar.com/avatar/${hash}?d=mm&s=200`
  }
}
