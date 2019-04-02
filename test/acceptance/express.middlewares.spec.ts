import request from 'supertest'
import { expect, server, sandbox } from '../helpers'
import { setHeadersMiddleware } from '../../middlewares'

describe('Middlewares:', () => {
  // describe('- setHeadersMiddleware: ', () => {
  //   it('returns 204 status code if successful', done => {
  //     const req = {
  //       headers: {
  //         origin: ''
  //       }
  //     }

  //     const status = sandbox.spy()

  //     const response = {
  //       header: function () {},
  //       status
  //     }

  //     setHeadersMiddleware(req, response)

  //     expect(status.calledOnce).to.be.equal(true)

  //     expect(status.firstCall.args[0]).to.be.equal(204)

  //     done()
  //   })
  // })

  describe('- HomeMiddleware: ', () => {
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
