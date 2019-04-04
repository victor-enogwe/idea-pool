import request from 'supertest'
import { expect } from 'chai'
import { server } from '../..'
import { testEmail, testPassword, passwordError, emailError, jwtError } from '../helpers/stubs'
import { GeneratedAuth } from '../../controllers'
import { jwtRegex } from '../../utils'
import { database } from '../../models'

describe('/api/v1/users:', () => {
  // let accessToken: string
  let refreshToken: string
  after(() => database.then(db => db.connection.dropDatabase()))

  describe('POST - login - /: ', () => {
    const requestEndpoint = '/api/v1/access-tokens'

    it('should not login a user with an invalid email', () => request(server)
      .post(requestEndpoint)
      .send({ email: 'testEmail', password: testPassword, name: 'testUser' })
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', emailError)))

    it('should not login a user with an invalid password', () => request(server)
      .post(requestEndpoint)
      .send({ email: testEmail, password: 'testPassword', name: 'testUser' })
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', passwordError)))

    it('should login a user with an valid email and password', () => request(server)
      .post(requestEndpoint)
      .send({ email: testEmail, password: testPassword })
      .expect(201)
      .then((res: request.Response) => {
        // accessToken = res.body.jwt
        refreshToken = res.body.refresh_token
        expect(res.body).to.have.property('jwt')
        expect(res.body).to.have.property('refresh_token')
        expect(Object.values(res.body as GeneratedAuth).every((value = '') => jwtRegex.test(value))).to.equal(true)
      }))
  })

  describe('POST - refresh token - /: ', () => {
    const requestEndpoint = '/api/v1/access-tokens/refresh'

    it('should throw error if refresh token is not present', () => request(server)
      .post(requestEndpoint)
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', jwtError)))

    it('should generate a new access token', () => request(server)
      .post(requestEndpoint)
      .send({ refresh_token: refreshToken })
      .expect(200)
      .then(async (res: request.Response) => {
        expect(res.body).to.have.property('jwt', res.body.jwt)
        expect(jwtRegex.test(res.body.jwt)).to.equal(true)
      }))

    // it('should invalidate the old access token', () => request(server)
    //   .get('/api/v1/me')
    //   .set('x-access-token', accessToken)
    //   .expect(500)
    //   .then(async (res: request.Response) => expect(res.body.error).to.have.property('message', 'invalid signature')))
  })

  describe('POST - logout - /: ', () => {
    const requestEndpoint = '/api/v1/access-tokens'

    it('should logout user', async () => request(server)
      .delete(requestEndpoint)
      .send({ refresh_token: refreshToken })
      .expect(204))

    // it('should invalidate all tokens', async () => request(server)
    //   .get('/api/v1/me')
    //   .set('x-access-token', refreshToken)
    //   .expect(500)
    //   .then((res: request.Response) => expect(res.body.error).to.have.property('message', 'invalid signature')))
  })
})
