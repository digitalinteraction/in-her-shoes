import {NextFunction, Request, Response, Router} from "express";
import checkToken from './../../middleware/authenticate'
import {IStory} from "../../schemas/story";
import {storeStory} from "../../controllers/story";
import {Reply} from "../../reply";
import {IUser} from "../../schemas/user";
import {getUserId} from "../../controllers/auth";
import {Schema} from "mongoose";
import {IExpense} from "../../schemas/expense";

let router: Router

export const storyRouter = () => {
  router = Router()
  router.use(checkToken)

  /**
   * Store a story in the database
   */
  router.post('/store', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const userId: Schema.Types.ObjectId = res.locals.user.id

    let storyData = {
      story: req.body.story || '',
      start: req.body.start || '',
      end: req.body.end || '',
      messageStranger: req.body.messageStranger || '',
      thankYouNote: req.body.thankYouNote || ''
    }

    let story: IStory
    try {
      story = await storeStory(storyData, res.locals.user.id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    let user: IUser
    try {
      user = await getUserId(userId)
      if (user.stories) {
        user.stories.push(story._id)
      } else {
        user.stories = [story._id]
      }

      await user.save()
    } catch (e) {
      console.log(e)
      e.message = '500'
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, story))
  })

  /**
   * Get all of a user's stored stories
   */
  router.get('/get', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const userId: Schema.Types.ObjectId = res.locals.user.id

    let user: IUser
    try {
      user = await getUserId(userId)
    } catch (e) {
      console.log(e)
      e.message = '500'
      return next(e)
    }

    let stories: IStory[]
    try {
      stories = await user.getStories()
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    // Get full expenses if story has one
    let expenses: IExpense[] = []
    for (let story of stories) {
      if (story.expense) {
        let expense: IExpense = await story.getExpense()
        expenses.push(expense)
      }
    }

    // Construct payload
    const payload = {
      stories: stories || [],
      expenses: expenses
    }

    return res.json(new Reply(200, 'success', false, payload))
  })

  return router
}