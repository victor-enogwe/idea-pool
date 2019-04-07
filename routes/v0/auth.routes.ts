import { Router } from 'express'
import { checkSchema } from 'express-validator/check'
import { email, password, token } from '../../utils'
import { AuthenticationController } from '../../controllers/v0'
import { checkValidationResult } from '../../middlewares'

export const authRoutes = Router()

authRoutes
  .post(
    '/',
    checkSchema({ email, password }),
    checkValidationResult,
    AuthenticationController.login
  )
  .post(
    '/refresh',
    checkSchema({ refresh_token: { ...token, in: ['body'] } }),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    AuthenticationController.refreshAccessToken
  )
  .delete(
    '/',
    checkSchema({ refresh_token: { ...token, in: ['body'] } }),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    AuthenticationController.logout
  )
