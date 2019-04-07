import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { meRoutes, userRoutes } from './user.routes'
import { ideaRoutes } from './idea.routes'

export const routerV0 = Router()

routerV0.use('/api/v0/access-tokens', authRoutes)
routerV0.use('/api/v0/me', meRoutes)
routerV0.use('/api/v0/users', userRoutes)
routerV0.use('/api/v0/ideas', ideaRoutes)
