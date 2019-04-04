import { Router } from 'express'
import { checkSchema } from 'express-validator/check'
import { email, name, password, token } from '../utils'
import { AuthenticationController, UserController } from '../controllers'
import { checkValidationResult } from '../middlewares'

export const userRoutes = Router()

userRoutes
  .post('/', checkSchema({ email, password, name }), checkValidationResult, AuthenticationController.signup)

export const meRoutes = Router()

meRoutes.get(
  '/',
  checkSchema({ 'X-Access-Token': token }),
  checkValidationResult,
  AuthenticationController.decodeAccessTokenMiddleware,
  UserController.me
)
