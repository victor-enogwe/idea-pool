import { logger } from '../logs'
import { HttpError } from 'http-errors'

/**
 * Http Error toJson
 * @TODO map error messages to user friendly errors in prod
 *
 * @property {HttpError} error the http error
 * @property { withStack: Boolean } options  The error option
 *
 * @return {HttpError | { message: string; stack?: string }}   error
 */
export function errorToJSON (error: HttpError, options: { withStack: Boolean }): { message: string; stack?: string; errors?: {} } {
  const object: { message: string; stack?: string; errors?: {} } = { message: error.message, stack: error.stack, errors: error.errors }
  if (!options.withStack) { object.stack = undefined }

  return object
}

/**
 * Service Error Handler
 *
 * @param {HttpError} error the error object
 *
 * @returns {Object} winston log info
 */
export function logServiceError (error: HttpError): object {
  const { message, code } = error
  let logMsg = ''
  if (error.response) {
    const { status, request, request: { res } } = error.response
    const { method, path, agent: { protocol }, headers } = request
    const { httpVersion, headers: { date = Date() }, client: { servername } } = res
    const ua = headers ? headers['user-agent'] : 'mentorXIdeas'
    logMsg = `::1 - - [${date}] "${method} ${path} HTTP/${httpVersion}" `
    logMsg += `${status} - "${message || ''} ${code || ''}" ${ua}"`
    logMsg += ` - "mentorXIdeas (+${protocol}//${servername})`
  }
  if (error.stack) {
    const stack = process.env.NODE_ENV === 'development' ? error.stack : ''
    logMsg += `\n${error.message} ${error.code || stack}`
  }

  return logger.error(logMsg)
}
