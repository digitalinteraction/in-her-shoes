import { Router, Request, Response, NextFunction } from 'express'
import checkToken from './../../middleware/authenticate'
import { IStory } from './../../schemas/story'
import {IMedia} from '../../schemas/media'
import {storeMedia, storeMediaRecord, getMediaByStory} from '../../controllers/media'
import {Reply} from "../../reply";
import {Schema} from "mongoose";
import {isStoryOwner} from "../../middleware/owner";
import * as multer from 'multer'

let upload = multer({ dest: 'uploads/' })

let router: Router

export const mediaRouter = () => {
  router = Router()

  router.get('/story/:id', async (req: Request, res: Response, next: NextFunction) => {
    const storyId: Schema.Types.ObjectId = req.params.id
    let media: IMedia

    // Get media
    try {
      media = await getMediaByStory(storyId)
    }
    catch (e) {
      e.message = '500'
      return next(e)
    }

    // Return 404 if no media record is found
    if (!media) {
      return next(new Error('404'))
    }

    /*
     * Return the file, or 404 if the actual file cannot be found.
     */
    try {
      return res.sendFile(media.path)
    } catch (e) {
      return next(new Error('404'))
    }
  })

  router.use(checkToken)
  router.use(isStoryOwner)

  /**
   * Upload an image for a story
   */
  router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    if (req.file === undefined) {
      return next(new Error('400'))
    }

    const mimeType = req.file.mimetype
    let ext = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]

    let imagePath: string
    let story: IStory = res.locals.story
    let media: IMedia

    try {
      imagePath = await storeMedia(req.file.path, req.file.originalname, ext)
      media = await storeMediaRecord(imagePath, mimeType, story)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, media))
  })

  return router
}
