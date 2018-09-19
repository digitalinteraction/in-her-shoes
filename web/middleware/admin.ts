import { Request, Response, NextFunction } from 'express'
import { Schema } from 'mongoose'
import { getUserId } from '../controllers/user'
import { IUser } from '../schemas/user'

/**
 * Check if a user is an admin
 * @param  req  [description]
 * @param  res  [description]
 * @param  next [description]
 * @return      [description]
 */
export default async function (req: Request, res: Response, next: NextFunction) {
  const userId: Schema.Types.ObjectId = res.locals.user.id

  let user: IUser
  try {
    user = await getUserId(userId)
  } catch (e) {
    res.locals.error = 500
    return next()
  }

  if (user.admin) {
    return next()
  } else {
    res.locals.error = 403
    return next()
  }
}
