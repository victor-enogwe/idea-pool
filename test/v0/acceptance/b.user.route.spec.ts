import request from 'supertest'
import { expect } from 'chai'
import { model, Types } from 'mongoose'
import { UnprocessableEntity } from 'http-errors'
import { server } from '../helpers'
import { testEmail, testPassword, passwordError, emailError, nameError } from '../helpers/stubs'
import { jwtRegex, passwordMessage } from '../../../utils'
import { GeneratedAuth, UserPassword } from '../../../interfaces'

describe('Users -: ', () => {
  let accessToken: string

  describe('/users:', () => {

    describe('POST - signup - /: ', () => {
      const requestEndpoint = '/users'

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

      it('should not allow invalid passwords in model', () => model<UserPassword>('UserPassword').insertMany([{ userId: Types.ObjectId() }])
        .catch((error) => expect(error).to.be.instanceOf(UnprocessableEntity, passwordMessage)))

      it('should register a user', () => server
        .post(requestEndpoint)
        .send({ email: testEmail, password: testPassword, name: 'testUser' })
        .expect(201)
        .then((res: request.Response) => {
          accessToken = res.body.jwt
          expect(res.body).to.have.property('jwt')
          expect(res.body).to.have.property('refresh_token')
          expect(Object.values(res.body as GeneratedAuth).every((value = '') => jwtRegex.test(value))).to.equal(true)
        }))
    })
  })

  describe('/me:', () => {
    const requestEndpoint = '/me'

    it('should get the user details', () => server
      .get(requestEndpoint)
      .set('x-access-token', accessToken)
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body).to.have.property('email', testEmail)
        expect(res.body).to.have.property('name', 'testUser')
        expect(res.body).to.have.property('avatar_url')
      }))
  })
})
