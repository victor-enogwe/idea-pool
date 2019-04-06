import { Router } from 'express'
import { checkSchema } from 'express-validator/check'
import { token, content, ease, impact, confidence, id, page } from '../utils'
import { checkValidationResult } from '../middlewares'
import { AuthenticationController, IdeaController } from '../controllers'

export const ideaRoutes = Router()
const ideaMutationValidation = { 'x-access-token': token, content, ease, impact, confidence }
ideaRoutes
  .get(
    '/',
    checkSchema({ 'x-access-token': token, page: { ...page, optional: true } }),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    IdeaController.find
  )
  .post(
    '/',
    checkSchema(ideaMutationValidation),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    IdeaController.create
  )
  .put(
    '/:id',
    checkSchema({ ...ideaMutationValidation, id }),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    IdeaController.update
  )
  .delete(
    '/:id',
    checkSchema({ 'x-access-token': token, id }),
    checkValidationResult,
    AuthenticationController.verifyTokenMiddleware,
    IdeaController.delete
  )
