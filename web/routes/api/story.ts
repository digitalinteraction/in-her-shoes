import {NextFunction, Request, Response, Router} from "express";
import checkToken from './../../middleware/authenticate'
import {IStory} from "../../schemas/story";
import {destroyStory, getStory, storeStory, updateStory} from "../../controllers/story";
import {Reply} from "../../reply";
import {IUser} from "../../schemas/user";
import {getUserId} from "../../controllers/auth";
import {Schema} from "mongoose";
import {IExpense} from "../../schemas/expense";
import {storeExpense} from "../../controllers/expense";

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

  /**
   * Edit a story
   */
  router.post('/edit', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    let story: IStory
    try {
      story = await getStory(req.body.id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }
    if(!story) {
      return next(new Error('404'))
    }

    // Reject if story does not belong to user
    // TODO: fix hacky string casting
    if (`${story.user}` !== `${res.locals.user.id}`) {
      return next(new Error('403'))
    }

    let storyData = {
      story: req.body.story || '',
      start: req.body.start || '',
      end: req.body.end || '',
      messageStranger: req.body.messageStranger || '',
      thankYouNote: req.body.thankYouNote || ''
    }

    try {
      story = await updateStory(storyData, req.body.id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, story))
  })

  /**
   * Destroy a story
   */
  router.delete('/destroy/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    let story: IStory
    try {
      story = await getStory(req.params.id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    // Reject if story does not exist
    if(!story) {
      return next(new Error('404'))
    }

    // Reject if story does not belong to user
    // TODO: fix hacky string casting
    if (`${story.user}` !== `${res.locals.user.id}`) {
      return next(new Error('403'))
    }

    try {
      await destroyStory(story._id)
    } catch (e) {
      e.message = '500'
    }

    return res.json(new Reply(200, 'success', false, null))
  })

  /**
   * Store and expense in the database
   */
  router.post('/expense/store', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    // Get user and story
    const userId: Schema.Types.ObjectId = res.locals.user.id
    const storyId: Schema.Types.ObjectId = req.body.storyId

    let user: IUser
    try {
      user = await getUserId(userId)
    } catch (e) {
      e.message = '500'
    }

    let story: IStory
    try {
      story = await getStory(storyId)
    } catch (e) {
      e.message = '500'
    }

    // Reject if story doesn't exist
    if (!story) {
      return next(new Error('404'))
    }

    // Reject if story does not belong to user
    // TODO: fix hacky string casting
    if (`${story.user}` !== `${user._id}`) {
      return next(new Error('403'))
    }

    const expenseData = {
      procedure: req.body.procedure || 0,
      travel: req.body.travel || 0,
      food: req.body.food || 0,
      childcare: req.body.childcare || 0,
      accommodation: req.body.accommodation,
      other: req.body.other || 0,
      paidDaysMissed: req.body.paidDaysMissed || 0
    }

    let expense: IExpense
    try {
      expense = await storeExpense(story._id, expenseData)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, expense))
  })

  return router
}