import request from 'supertest'
import { createSandbox } from 'sinon'
import { app } from '../../../'

export const sandbox = createSandbox()
export const server = request.agent(app)
