import { Router, Response, Request, NextFunction} from 'express'
import { Reply } from '../../reply'
import { IUser } from "../../schemas/user"
import {authenticateUser, generateToken, storeUser} from "../../controllers/auth";

let routes: Router

const auth = () => {
  routes = Router()
  routes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    // Get username and password
    const username: string = req.body.username
    let password: string = req.body.password

    // abort if either username or password are null
    if (!username || !password) {
      let e: Error = new Error('400')
      return next(e)
    }

    let user: IUser
    try {
      user = await storeUser(username, password)
    } catch (e) {
      return next(e)
    }

    let token: string
    try {
      token = generateToken(user)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    // let response = responses.success
    let response = new Reply(200, 'success', false, { user, token })
    // response.payload = { user, token }
    return res.json(response)
  })

  /**
   * Authenticate a user and return a JWT token
   * @type {Object}
   */
  routes.post('/authenticate', async (req: Request, res: Response, next: NextFunction) => {
    // Get username and password from request
    const username: string = req.body.username
    let password: string = req.body.password

    let token: string
    try {
      token = await authenticateUser(username, password)
    } catch (e) {
      if (e.message === '401') {
        res.locals.customErrorMessage = 'password or email is incorrect'
        return next(e)
      }
    }

    let response = new Reply(200, 'success', false, { token })
    return res.json(response)
  })
  return routes
}

export default auth
