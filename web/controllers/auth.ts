import {IUser} from "../schemas/user";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { getUser } from './user'


/**
 * Generate a JWT token for a user
 * @param user
 */
export function generateToken(user: IUser): string {
  // Hash given password with matching user's stored iv

  // create a payload
  let payload = {
    id: user.id,
    username: user.username
  }

  // create and sign token against the app secret
  return jwt.sign(payload, process.env.SECRET, {
    expiresIn: '1 day' // expires in 24 hours
  })
}

/**
 * Authenticate a user and return a JWT token
 * @param username
 * @param password
 */
export async function authenticateUser(username: string, password: string): Promise<string> {
  // Look for user with matching username
  let user: IUser
  try {
    user = await getUser(username)
  } catch (e) {
    e.message = '401'
    throw e
  }

  if (!user) {
    throw new Error('401')
  }

  // Hash given password with matching user's stored iv
  const hash: crypto.Hash = crypto.createHash('sha256')
  hash.update(`${user.iv}${password}`)
  password = hash.digest('hex')
  // Compare passwords and abort if no match
  if (user.password !== password) {
    throw new Error('401')
  }

  let token: string
  try {
    token = await generateToken(user)
  } catch (e) {
    e.message = '500'
    throw e
  }

  return token
}
