import { expect } from 'chai'
import { Unauthorized } from 'http-errors'
import { AuthenticationController, Decoded } from '../../controllers'
import { testPassword, hash, refreshTokenExpiresIn, refresh_secret, secret, userId } from '../helpers/stubs'
import { jwtRegex } from '../../utils'

describe('AuthenticationController:', () => {
  let accessToken: string
  let refreshToken: string

  describe('Generate Token: ', () => {

    it('should generate a jwt and a refresh token', done => {
      const tokens = AuthenticationController.generateAuthToken({
        hash,
        password: testPassword,
        refreshTokenExpiresIn,
        refresh_secret,
        secret,
        userId
      })
      accessToken = tokens.jwt
      refreshToken = tokens.refresh_token || ''

      expect(tokens).to.have.property('jwt', tokens.jwt)
      expect(tokens).to.have.property('refresh_token', tokens.refresh_token)
      expect(Object.values(tokens).every((value = '') => jwtRegex.test(value))).to.equal(true)
      done()
    })

    it('should generate only a jwt token', done => {
      const tokens = AuthenticationController.generateAuthToken({
        hash,
        password: testPassword,
        secret,
        userId
      })

      expect(tokens).to.have.property('jwt', tokens.jwt)
      expect(tokens).to.not.have.property('srefresh_token')
      done()
    })

    it('should throw an Unauthorized error', done => {
      const args = {
        hash,
        password: 'testPassword',
        refreshTokenExpiresIn,
        refresh_secret,
        secret,
        userId
      }

      expect(AuthenticationController.generateAuthToken.bind(AuthenticationController, args)).to.throw(
        Unauthorized, 'unauthorized access! invalid password'
      )
      done()
    })
  })

  describe('Verify Token: ', () => {

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
      const keys = ['userId', 'token_type', 'iat', 'exp', 'aud', 'iss']
      expect(decodedAccessToken).to.have.keys(keys)
      expect(decodedRefreshToken).to.have.keys(keys)
      done()
    })
  })
})
