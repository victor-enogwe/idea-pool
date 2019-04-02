import { sandbox } from './helpers'
import { server } from '../'
import { logger } from '../logs'

before(() => {
  server.listen(3000)
  sandbox.spy(logger, 'info')
  sandbox.spy(logger, 'error')
})

after(() => {
  server.close()
  sandbox.restore()
})
