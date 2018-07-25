import * as express from "express"
import {IStory} from "../schemas/story"
import {getStory} from "../controllers/story"
import {Schema} from "mongoose"

/**
 * Check user owns a story
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @returns {Promise<void>}
 */
export async function isStoryOwner (req: express.Request, res: express.Response, next: express.NextFunction) {
  // fail if there are existing errors from higher up the middleware chain
  if (res.locals.error) {
    return next(new Error(`${res.locals.error}`))
  }

  /*
  Get the story id from the body of a post request, get from the url if not present.
   */
  const storyId: Schema.Types.ObjectId = req.body.storyId || req.path.split('/')[req.path.split('/').length - 1]

  let story: IStory
  try {
    story = await getStory(storyId)
  } catch (e) {
    res.locals.error = 500
    return next()
  }
  
  // Reject if story does not exist
  if(!story) {
    res.locals.error = 404
    return next()
  }

  // Reject if story does not belong to user
  // TODO: fix hacky string casting
  if (`${story.user}` !== `${res.locals.user.id}`) {
    res.locals.error = 403
    return next()
  }

  res.locals.story = story

  return next()
}