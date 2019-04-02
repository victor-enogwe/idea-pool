const { ALLOWED_ORIGINS, CLIENT_URL } = process.env
import morgan from 'morgan'
import { logger } from '../logs'
import { Response, Request, NextFunction, Handler,  } from 'express-serve-static-core';
import { HttpError, NotFound, Forbidden, UnprocessableEntity } from 'http-errors';
import { logServiceError, errorToJSON, isDevMode } from '../utils';
import { validationResult } from 'express-validator/check';

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
 * Http Request Logging Middlware
 *
 * @param {Request} req the http request object
 * @param {Response} res the http response object
 *
 * @returns {Response} the http response
 */
export function setHeadersMiddleware (req: Request, res: Response): Response {
  const allowedOrigins = [...ALLOWED_ORIGINS.split(','), CLIENT_URL]
  const allowedOrigin = allowedOrigins.includes(req.get('origin'))
  const headers1 = 'Origin, X-Requested-With, Content-Type, Accept'
  const headers2 = ',Authorization, Access-Control-Allow-Credentials'
  if (allowedOrigin) res.header('Access-Control-Allow-Origin', allowedOrigins.join(','))
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  res.header('Access-Control-Allow-Headers', `${headers1} ${headers2}`)
  res.header('Access-Control-Allow-Credentials', 'true')

  return res.status(204)
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
export function checkValidationResult(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
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
  if (error instanceof Forbidden) status = 403
  if (error.errors) status = 400
  if (error instanceof HttpError) status = error.statusCode
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

  return res.status(status).json({ status, error: errorToJSON(error, { withStack: isDevMode }) })
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
