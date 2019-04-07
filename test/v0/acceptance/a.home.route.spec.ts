import request from 'supertest'
import { server, sandbox } from '../helpers'
import { ServiceUnavailable } from 'http-errors'
import { expect } from 'chai'
import { logger } from '../../../logs'
import { onError } from '../../..'

describe('/api/v0:', () => {
  const info = sandbox.spy(logger, 'info')
  const error = sandbox.spy(logger, 'error')

  after(() => sandbox.restore())

  describe('GET - /: ', () => {
    const requestEndpoint = '/'

    it('should return the Api status message', () => server
      .get(requestEndpoint)
      .expect(200)
      .then((res: request.Response) => {
        info.calledWith({ test: `🚧 Api is Listening on port 3000` })
        info.calledWith({ test: `🚧 Api is Listening on port 3000` })
        expect(res.body).to.deep.equal({ status: 200, message: 'Api Up.' })
      }))
  })

  describe('404 - /: ', () => {

    it('should return the Api 404 message', () => server
      .get('/not-exists')
      .expect(404)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', 'Route Does Not Exist On The Api')))
  })

  describe('- onError', () => {

    it('should log an error', (done) => {
      const errorEACCESS = new ServiceUnavailable('port requires elevated privileges')
      const errorEADDRINUSE = new ServiceUnavailable('port requires elevated privileges')
      errorEACCESS.code = 'EACCES'
      errorEADDRINUSE.code = 'EADDRINUSE'
      onError(errorEACCESS)
      error.calledWith({ test: 'port requires elevated privileges' })
      onError(errorEADDRINUSE)
      error.calledWith({ test: 'port is already in use' })
      done()
    })
  })

  describe('- Option Headers', () => {

    describe('origin -: ', () => {
      before((done) => {
        process.env.ALLOWED_ORIGINS = allowedOrigin
        process.env.NODE_ENV = 'development'
        done()
      })

      after((done) => {
        process.env.ALLOWED_ORIGINS = ''
        process.env.NODE_ENV = 'test'
        done()
      })

      const allowedOrigin = 'http://theorigin.com'

      it('should disable cors', () => server
        .options('/')
        .set('origin', allowedOrigin)
        .expect('Access-Control-Allow-Origin', '*')
        .expect(204))

      it('should reject invalid origin', () => server
        .options('/')
        .set('origin', 'http://anotherorigin.com')
        .withCredentials()
        .expect(403)
        .then((res) => expect(res.body.error).to.have.property('stack')))
    })

    it('should set the correct option headers', () => server
      .options('/')
      .expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect(204))
  })
})
