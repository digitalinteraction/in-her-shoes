import { Router, Request, Response, NextFunction } from 'express'
import { getUnpublished } from '../../controllers/story'
import { IStory } from '../../schemas/story'
import { Reply } from '../../reply'

let router: Router

export const adminRouter = () => {
  router = Router()

  /**
   * Get all unpublised stories
   * @param  '/unpublished'
   * @param
   * @return
   */
  router.get('/unpublished', async (req: Request, res: Response, next: NextFunction) => {
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

  return router
}
