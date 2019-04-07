import { Router } from 'express'
import { checkSchema } from 'express-validator/check'
import { email, name, password, token } from '../../utils'
import { AuthenticationController, UserController } from '../../controllers/v0'
import { checkValidationResult } from '../../middlewares'

export const userRoutes = Router()

userRoutes
  .post('/', checkSchema({ email, password, name }), checkValidationResult, AuthenticationController.signup)

export const meRoutes = Router()

meRoutes.get(
  '/',
  checkSchema({ 'x-access-token': token }),
  checkValidationResult,
  AuthenticationController.verifyTokenMiddleware,
  UserController.me
)
