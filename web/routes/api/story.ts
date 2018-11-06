import {NextFunction, Request, Response, Router} from "express";
import checkToken from './../../middleware/authenticate'
import {IStory} from "../../schemas/story";
import {destroyStory, getStory, storeStory, updateStory, getPublicStories} from "../../controllers/story";
import {Reply} from "../../reply";
import {IUser} from "../../schemas/user";
import {getUserId} from "../../controllers/user";
import {Schema} from "mongoose";
import {IExpense} from "../../schemas/expense";
import {storeExpense} from "../../controllers/expense";
import {isStoryOwner} from "../../middleware/owner";
import { IPosition } from '../../schemas/position'

let router: Router

export const storyRouter = () => {
  router = Router()

  /**
   * Get all public stories from database
   */
  router.get('/public', async (req: Request, res: Response, next: NextFunction) => {
    let stories: IStory[] = []

    try {
      stories = await getPublicStories()
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    // Attach expenses to each story
    let payload: {}[] = []
    for (let i: number = 0; i < stories.length; i++) {
      try {
        const expense: IExpense = await stories[i].getExpense()
        const positions: IPosition[] = await stories[i].getPositions()
        const item = {
          story: stories[i],
          expense: expense || null,
          positions: positions
        }
        payload.push(item)
      } catch (e) {
        e.message = '500'
        return next(e)
      }
    }
    return res.json(new Reply(200, 'success', false, payload))
  })

  router.get('/get/:storyId', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.storyId) {
      return next(new Error('400'))
    }

    let story: IStory
    try {
      story = await getStory(req.params.storyId)
    } catch (e) {
      e.message = '500'
    }

    if (!story.isPublished) {
      return next(new Error('404'))
    }

    if (!story) {
      return next(new Error('404'))
    }

    let item: any = {
      story: story,
      positions: null,
      expenses: null
    }
    try {
      item.positions = await story.getPositions()
      item.expenses = await story.getExpense()
    } catch (e) {
      e.status = 500
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, item))
  })

  router.use(checkToken)

  /**
   * Store a story in the database
   */
  router.post('/store', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const userId: Schema.Types.ObjectId = res.locals.user.id

    let user: IUser
    try {
      user = await getUserId(userId)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    let storyData = {
      story: req.body.story || '',
      start: req.body.start || '',
      end: req.body.end || '',
      messageStranger: req.body.messageStranger || '',
      thankYouNote: req.body.thankYouNote || ''
    }

    let story: IStory
    try {
      story = await storeStory(storyData, user)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    try {
      user = await getUserId(userId)
      if (user.stories) {
        user.stories.push(story._id)
      } else {
        user.stories = [story._id]
      }

      await user.save()
    } catch (e) {
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

    let payload: {}[] = []

    for (let story of stories) {
      let expense: IExpense
      let positions: IPosition[]
      try {
        expense = await story.getExpense()
        positions = await story.getPositions()
        const item = {
          story: story,
          expense: expense || null,
          positions: positions || null
        }
        payload.push(item)
      } catch (e) {
        e.message = '500'
        return next(e)
      }
    }

    return res.json(new Reply(200, 'success', false, payload))
  })

  /**
   *********************************************************************************************************************
   * User must own story to access any of the endpoints below
   *********************************************************************************************************************
   */

  // Set middleware to check user is resource owner
  router.use(isStoryOwner)

  /**
   * Edit a story
   */
  router.post('/edit', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    let story: IStory = res.locals.story
    let storyData = {
      story: req.body.story || '',
      start: req.body.start || '',
      end: req.body.end || '',
      messageStranger: req.body.messageStranger || '',
      thankYouNote: req.body.thankYouNote || ''
    }

    try {
      story = await updateStory(storyData, story._id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, story))
  })

  /**
   * Store and expense in the database
   */
  router.post('/expense/store', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const story: IStory = res.locals.story
    const expenseData = {
      procedure: req.body.procedure || 0,
      travel: req.body.travel || 0,
      food: req.body.food || 0,
      childcare: req.body.childcare || 0,
      accommodation: req.body.accommodation,
      other: req.body.other || 0,
      paidDaysMissed: req.body.paidDaysMissed || 0,
      currency: req.body.currency || '€'
    }

    let expense: IExpense
    try {
      expense = await storeExpense(story._id, expenseData)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    let response: any = {}

    try {
      response.positions = await story.getPositions()
    } catch (e) {
      console.error(e)
    }

    response.story = story
    response.expenses = expense || null

    return res.json(new Reply(200, 'success', false, response))
  })

  /**
   * Destroy a story
   */
  router.delete('/destroy/:storyId', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const story: IStory = res.locals.story

    try {
      await destroyStory(story._id)
    } catch (e) {
      e.message = '500'
    }

    return res.json(new Reply(200, 'success', false, null))
  })

  return router
}
