import { sandbox, logger, server } from './helpers'

before(() => {
  server.listen(3000)
  sandbox.spy(logger, 'info')
  sandbox.spy(logger, 'error')
})

after(() => {
  server.close()
  sandbox.restore()
})
