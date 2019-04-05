import request from 'supertest'
import { expect } from 'chai'
import { server } from '../helpers'
import { testEmail, testPassword, passwordError, emailError, nameError } from '../helpers/stubs'
import { jwtRegex } from '../../utils'
import { GeneratedAuth } from '../../interfaces'

describe('/api/v1/users:', () => {

  describe('POST - signup - /: ', () => {
    const requestEndpoint = '/api/v1/users'

    it('should not register a user with an invalid name', () => server
      .post(requestEndpoint)
      .send({ email: testEmail, password: testPassword, name: 'test  User' })
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', nameError)))

    it('should not register a user with an invalid email', () => server
      .post(requestEndpoint)
      .send({ email: 'testEmail', password: testPassword, name: 'testUser' })
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', emailError)))

    it('should not register a user with an invalid password', () => server
      .post(requestEndpoint)
      .send({ email: testEmail, password: 'testPassword', name: 'testUser' })
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', passwordError)))

    it('should register a user', () => server
      .post(requestEndpoint)
      .send({ email: testEmail, password: testPassword, name: 'testUser' })
      .expect(201)
      .then((res: request.Response) => {
        expect(res.body).to.have.property('jwt')
        expect(res.body).to.have.property('refresh_token')
        expect(Object.values(res.body as GeneratedAuth).every((value = '') => jwtRegex.test(value))).to.equal(true)
      }))
  })
})
