import {IUser} from "../schemas/user";
import * as jwt from "jsonwebtoken";
import models from "../models";
import * as crypto from "crypto";
import {Schema} from "mongoose";

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

/**
 * Store a user in the database
 * @param username
 * @param password
 */
export async function storeUser(username: string, password: string): Promise<IUser> {
  // check for an existing user
  let sUser: IUser
  try {
    sUser = await getUser(username)
  } catch (error) {
    error.message = '500'
    throw error
  }

  if (sUser) {
    throw new Error('403')
  }

  // Hash user's given password after mixing with a random id
  let iv: string
  const hash: crypto.Hash = crypto.createHash('sha256')
  iv = crypto.randomBytes(16).toString('hex')
  hash.update(`${iv}${password}`)
  password = hash.digest('hex')

  let user = null;
  try {
    user = await models.User.create({username, password, iv})
  } catch (e) {
    e.message = '500'
    throw e
  }

  return user
}

/**
 * Get user by username
 * @param username
 */
async function getUserUsername(username: string): Promise<IUser> {
  return await models.User.findOne({username: username})
}

/**
 * Get user by id
 * @param id
 */
export async function getUserId(id: Schema.Types.ObjectId): Promise<IUser> {
  return await models.User.findOne({_id: id})
}

/**
 * get user by id or username
 * @param identifier: string | Schema.Types.ObjectId
 *
 * TODO: fix ids being interpreted as strings when passed from request body
 */
export async function getUser(identifier: string | Schema.Types.ObjectId): Promise<IUser> {
  return identifier instanceof Schema.Types.ObjectId ? await getUserId(identifier): await getUserUsername(identifier)
}

/**
 * Destroy a user by id
 * @param id
 */
export async function destroyUser(id: Schema.Types.ObjectId): Promise<void> {
  return await models.User.deleteOne({_id: id})
}