import * as express from 'express'
import models from '../../models'
import {IUser} from '../../schemas/user'
import { Reply } from '../../reply'
import { getUserId, destroyUser } from '../../controllers/user'
import checkToken from '../../middleware/authenticate'
import {Request} from "express";
import {Response} from "express";
import {NextFunction} from "express";
import { Schema } from 'mongoose'

let router : express.Router

export const userRouter = () => {
  router = express.Router()

  router.use(checkToken)

  router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id
    let user: IUser
    try {
      user = await getUserId(userId)
    } catch (e) {
      return next(e)
    }
    return res.json(new Reply(200, 'success', false, { user }))
  })

  router.delete('/destroy', async function (req, res, next) {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id
    try {
      await destroyUser(userId)
    } catch (e) {
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, {}))
  })

  return router
}
