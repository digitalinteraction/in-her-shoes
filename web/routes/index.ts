import { Express } from 'express'

import home from './home'
import {authRouter} from './api/auth'
import {userRouter} from './api/user'
import {storyRouter} from "./api/story";

/**
 * Router
 * @param {e.Express} app
 * @returns {e.Express}
 */
export const addRoutes = (app: Express) => {
  app.use('/', home())
  app.use('/api/auth', authRouter())
  app.use('/api/user', userRouter())
  app.use('/api/story', storyRouter())
  return app
}
