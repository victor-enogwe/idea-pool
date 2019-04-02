import request from 'supertest'
import { expect } from 'chai'
import { server } from '../../'

describe('Middlewares:', () => {

  describe('- Home Route: ', () => {
    it('should return Api status message', done => {
      const requestEndpoint = '/'

      request(server)
        .get(requestEndpoint)
        .expect(200)
        .end((err: any, res: any) => {
          if (err) { throw err }

          expect(res.body).to.deep.equal({
            status: 200,
            message: 'Api Up.'
          })

          done()
        })
    })
  })
})
