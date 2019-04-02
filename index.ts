import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import * as http from 'http'
import mongoose from 'mongoose'
import { HttpError } from 'http-errors'
import { Logger } from 'winston'
import { logger } from './logs'
import { isTestMode, MONGODB_URI, NODE_ENV, logServiceError } from './utils'
import {
  apiHomeMiddleware,
  errorFourZeroFourMiddleware,
  httpErrorMiddleware,
  httpRequestLoggingMiddleware,
  setHeadersMiddleware
} from './middlewares'

(mongoose.Promise) = Promise
export const app = express()
export const server = http.createServer(app)
const PORT = process.env.PORT || 3000

/**
 * Event listener for HTTP server 'listening' event.
 *
 * @param {http.Server} server the http server instance
 *
 * @returns {Logger} server process is continous here, so no returns
 */
export function onListening (httpServer: http.Server): void {
  const addr = httpServer.address()
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr && addr.port}`
  logger.info(`🚧 Api is Listening on ${bind} - ${NODE_ENV}`)
}

/**
 * Event listener for HTTP server 'error' event.
 * @param {HttpError} error an error message
 *
 * @returns {Logger} error already logged exits process
 */
export function onError (error: HttpError): Logger {
  if (error.syscall !== 'listen') { return logger.error(error.message) }

  switch (error.code) {
    case 'EACCES':
      if (isTestMode) { process.exit(1) }
      return logger.error('port requires elevated privileges')
    case 'EADDRINUSE':
      if (isTestMode) { process.exit(1) }
      return logger.error('port is already in use')
    default:
      return logger.error(error.message)
  }
}

app.options('*', setHeadersMiddleware)
app.use(express.urlencoded({ extended: true }), express.json(), helmet(), cors(), httpRequestLoggingMiddleware)
app.get('/', apiHomeMiddleware)
app.use(errorFourZeroFourMiddleware, httpErrorMiddleware)

server.on('listening', onListening.bind(null, server)).on('error', onError)

// Only run this section if file is loaded directly (eg `node server.js`)
// module loaded by something else eg. test or cyclic dependency
// Fixes error: 'Trying to open unclosed connection.'
if (require.main === module) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => server.listen(PORT))
    .catch((error: HttpError) => logServiceError(error))
}
