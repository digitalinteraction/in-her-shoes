import { Router, Request, Response, NextFunction } from 'express'
import { getUnpublished, getStory, publishStory, addMessageToStory } from '../../controllers/story'
import { IStory } from '../../schemas/story'
import { Reply } from '../../reply'
import isAdmin from '../../middleware/admin'
import checkToken from '../../middleware/authenticate'
import { Schema } from 'mongoose'

let router: Router

export const adminRouter = () => {
  router = Router()

  router.use(checkToken)
  router.use(isAdmin)


  /**
   * Get all unpublised stories
   * @param  '/unpublished'
   * @param
   * @return
   */
  router.get('/unpublished', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    let unpublished: IStory[]

    try {
      unpublished = await getUnpublished()
    } catch(e) {
      return next(new Error('500'))
    }

    let items: {}[] = []

    for(let story of unpublished) {
      let expenses = await story.getExpense()
      const item = {
        story: story,
        expenses: expenses
      }

      items.push(item)
    }

    return res.json(new Reply(200, 'success', false, items))
  })

  router.get('/publish/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) return next(new Error(`${res.locals.error}`))

    let story: IStory
    try {
      story = await getStory(req.params.id)
    } catch (e) {
      return next(new Error('500'))
    }

    if (!story) return next(new Error('404'))

    try {
      story = await publishStory(story)
    } catch (e) {
      return next(new Error('500'))
    }

    return res.json(new Reply(200, 'success', false, story))
  })

  router.post('/store/message', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) return next(new Error(`${res.locals.error}`))

    let story: IStory
    try {
      story = await getStory(req.body.id)
    } catch(e) {
      return next(new Error('500'))
    }

    if (!story) return next(new Error('404'))

    try {
      story = await addMessageToStory(story, req.body.message)
    } catch (e) {
      return next(new Error('500'))
    }

    return res.json(new Reply(200, 'success', false, story))
  })

  return router
}
