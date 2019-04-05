import { expect } from 'chai'
import request from 'supertest'
import { server } from '../helpers'
import { database } from '../../models'
import { testEmail, testPassword, ideaFieldsError, idea, ideaMembers } from '../helpers/stubs'
import { Idea } from '../../interfaces'

describe('/api/v1/ideas:', () => {
  after(() => database.then(db => db.connection.dropDatabase()))
  let token: string
  let ideadId: string
  const requestEndpoint = '/api/v1/ideas'
  const authEndpoint = '/api/v1/access-tokens'
  before(async () => {
    token = await server
      .post(authEndpoint)
      .send({ email: testEmail, password: testPassword })
      .then((res: request.Response) => res.body.jwt)
  })

  describe('POST - create - /: ', () => {
    it('should validate all idea fields', () => server
      .post(requestEndpoint)
      .set({ 'x-access-token': token })
      .send({})
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', ideaFieldsError)))

    it('should create an idea', () => server
      .post(requestEndpoint)
      .set({ 'x-access-token': token })
      .send(idea)
      .expect(201)
      .then((res: request.Response) => {
        ideadId = res.body.id
        expect(Object.keys(res.body)).to.have.members(ideaMembers)
      }))
  })

  describe('PUT - update - /: ', () => {
    it('should validate all idea fields', () => server
      .put(`${requestEndpoint}/${ideadId}`)
      .set({ 'x-access-token': token })
      .send({})
      .expect(422)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', ideaFieldsError)))

    it('should update an idea', () => server
      .put(`${requestEndpoint}/${ideadId}`)
      .set({ 'x-access-token': token })
      .send({ content: 'hello world', ease: 20, impact: 20, confidence: 20 })
      .expect(200)
      .then((res: request.Response) => {
        expect(Object.keys(res.body)).to.have.members(ideaMembers)
        expect(res.body.content).to.equal('hello world')
        expect(res.body.ease).to.equal(20)
        expect(res.body.confidence).to.equal(20)
        expect(res.body.impact).to.equal(20)
        expect(res.body.average_score).to.equal(20.0.toFixed(1))
      }))
  })

  describe('GET - find - /: ', () => {
    it('should return ideas', () => server
      .get(requestEndpoint)
      .set({ 'x-access-token': token })
      .expect(200)
      .then((res: request.Response) => res.body.forEach((item: Idea) => expect(Object.keys(item)).to.have.members(ideaMembers))))

    it('should paginate ideas', () => server
      .get(requestEndpoint)
      .set({ 'x-access-token': token })
      .query({ page: 2 })
      .expect(404)
      .then((res: request.Response) => expect(res.body.error).to.have.property('message', 'ideas not found')))
  })

  describe('DELETE - delete - /: ', () => {

    it('should delete an idea', () => server
      .delete(`${requestEndpoint}/${ideadId}`)
      .set({ 'x-access-token': token })
      .expect(204))
  })
})
