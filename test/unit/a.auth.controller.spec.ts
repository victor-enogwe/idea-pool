import { expect } from 'chai'
import { AuthenticationController } from '../../controllers'
import { testPassword, secret, userId } from '../helpers/stubs'
import { jwtRegex } from '../../utils'
import { Decoded } from '../../interfaces'

describe('AuthenticationController:', () => {
  const accessToken = AuthenticationController.generateToken({ secret, userInfo: { userId } })
  const refreshToken = AuthenticationController.generateToken({ secret, userInfo: { userId } })

  describe('.generateToken: ', () => {

    it('should generate a valid jwt token', done => {
      expect([accessToken, refreshToken].every((value) => jwtRegex.test(value))).to.equal(true)
      done()
    })
  })

  describe('.verifyToken: ', () => {

    it('should verify a jwt token', done => {
      const verifedTokens = [accessToken, refreshToken].every(token => AuthenticationController.verifyToken({ token: accessToken, secret }))
      expect(verifedTokens).to.equal(true)
      done()
    })
  })

  describe('Hash String: ', () => {

    it('should generate a hashed string', done => {
      const hashedString = AuthenticationController.hashString(testPassword)
      expect(AuthenticationController.compareHash({ hash: hashedString, comparison: testPassword })).to.equal(true)
      done()
    })
  })

  describe('Decode Token: ', () => {

    it('should decode a jwt token', done => {
      const decodedAccessToken: Decoded = AuthenticationController.decodeToken({ token: accessToken })
      const decodedRefreshToken: Decoded = AuthenticationController.decodeToken({ token: refreshToken })
      const keys = ['userId', 'iat', 'exp', 'aud', 'iss']
      expect(decodedAccessToken).to.have.keys(keys)
      expect(decodedRefreshToken).to.have.keys(keys)
      done()
    })
  })
})
