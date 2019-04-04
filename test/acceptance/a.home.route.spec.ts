import request from 'supertest'
import { expect } from 'chai'
import { server } from '../..'

describe('/api/v1:', () => {

  describe('GET - /: ', () => {
    const requestEndpoint = '/'

    it('should return Api status message', () => request(server)
      .get(requestEndpoint)
      .expect(200)
      .then((res: request.Response) => expect(res.body).to.deep.equal({ status: 200, message: 'Api Up.' })))
  })
})
