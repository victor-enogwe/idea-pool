import request from 'supertest'
import { app } from '../..'

export const sandbox = require('sinon').createSandbox()
export const server = request.agent(app)
