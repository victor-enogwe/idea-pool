import morgan from 'morgan'
import { logger } from '../logs'
import { Response, Request, NextFunction, Handler } from 'express-serve-static-core'
import { HttpError, NotFound, Forbidden, UnprocessableEntity } from 'http-errors'
import { logServiceError, errorToJSON, corsError } from '../utils'
import { validationResult } from 'express-validator/check'

/**
 * Http Request Logging Middlware
 *
 * @param {Request} req the http request object
 * @param {Response} res the http response object
 * @param {NextFunction} next the next middleware function
 *
 * @returns {Handler} the next middleware function
 */
export function httpRequestLoggingMiddleware (req: Request, res: Response, next: NextFunction): Handler {
  return morgan('combined', {
    immediate: true, stream: { write: msg => logger.info(msg.trim()) }
  })(req, res, next)
}

/**
 * Http Cors Middleware
 *
 * @param {sriing} origin the http request object
 * @param {Function} callback the cors callback function
 *
 * @returns {void}
 */
export function setHeadersMiddleware (origin: string, callback: Function): void {
  try {
    const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || ''
    if (origin && !ALLOWED_ORIGINS.split(',').includes(origin)) { throw new Forbidden(corsError) }

    return callback(null, true)
  } catch (error) {
    return callback(error)
  }
}

/**
 * 404 Error Middlware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 *
 * @returns {any} the next middleware function
 */
export function errorFourZeroFourMiddleware (req: Request, res: Response, next: NextFunction): void {
  return next(new NotFound('Route Does Not Exist On The Api'))
}

/**
 * Check Validation Result
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 * @returns {any} the next middleware function
 */
export function checkValidationResult (req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  return errors.isEmpty() ? next() : next(new UnprocessableEntity(JSON.stringify(errors.array())))
}

/**
 * Express Error Middleware
 *
 * @param {HttpError} error the error object
 * @param {Request} req the http request object
 * @param {Response} res the http response object
 *
 * @returns {Response} the error in json
 */
export function httpErrorMiddleware (error: HttpError, req: Request, res: Response, next: NextFunction): Response {
  let status = 500
  if (error instanceof Forbidden) { status = 403 }
  if (error.errors) { status = 422 }
  if (error instanceof HttpError) { status = error.statusCode }
  error.response = {
    status,
    request: {
      ...req,
      path: req.path,
      agent: { protocol: req.protocol },
      res: {
        httpVersion: req.httpVersion,
        headers: { date: req.headers.date },
        client: { servername: req.hostname }
      }
    }
  }

  logServiceError(error)

  return res.status(status).json({ status, error: errorToJSON(error, { withStack: process.env.NODE_ENV === 'development' }) })
}

/**
 * Home Middleware
 *
 * @param {Request} req the http request object
 * @param {Response} res the http response object
 *
 * @returns {Response} the http json response
 */
export function apiHomeMiddleware (req: Request, res: Response): Response {
  return res.status(200).json({ status: 200, message: 'Api Up.' })
}
