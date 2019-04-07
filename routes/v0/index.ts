import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { meRoutes, userRoutes } from './user.routes'
import { ideaRoutes } from './idea.routes'

export const routerV0 = Router()

routerV0.use('/access-tokens', authRoutes)
routerV0.use('/me', meRoutes)
routerV0.use('/users', userRoutes)
routerV0.use('/ideas', ideaRoutes)
