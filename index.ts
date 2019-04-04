import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import responseTime from 'response-time'
import * as http from 'http'
import { HttpError } from 'http-errors'
import { Logger } from 'winston'
import { logger } from './logs'
import { isTestMode, NODE_ENV, logServiceError } from './utils'
import { userRoutes, authRoutes, meRoutes } from './routes'
import { database } from './models'
import {
  apiHomeMiddleware,
  errorFourZeroFourMiddleware,
  httpErrorMiddleware,
  httpRequestLoggingMiddleware,
  setHeadersMiddleware
} from './middlewares'

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

app.use(responseTime({ header: 'X-Runtime' }))
app.options('*', setHeadersMiddleware, cors(), helmet({ noSniff: true, noCache: true }))
app.use(
  express.urlencoded({ extended: true }),
  express.json(),
  helmet({ noSniff: true, noCache: true }),
  cors(),
  httpRequestLoggingMiddleware
)
app.get('/', apiHomeMiddleware)
app.use('/api/v1/access-tokens', authRoutes)
app.use('/api/v1/me', meRoutes)
app.use('/api/v1/users', userRoutes)
app.use(errorFourZeroFourMiddleware, httpErrorMiddleware)

server.on('listening', onListening.bind(null, server)).on('error', onError)

// Only run this section if file is loaded directly (eg `node server.js`)
// module loaded by something else eg. test or cyclic dependency
// Fixes error: 'Trying to open unclosed connection.'
if (require.main === module) {
  database.then(() => server.listen(PORT)).catch((error: HttpError) => logServiceError(error))
}
