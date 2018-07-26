import * as path from "path"
import * as fs from "fs"
import {IMedia} from "../schemas/media"
import models from "../models"
import {promisify} from "util"
import * as crypto from "crypto"
import {Schema} from "mongoose";
import {IStory} from "../schemas/story";

const rename = promisify(fs.rename)

/**
 * Store a file
 * @param {string} storedPath
 * @param {string} fileName
 * @param {string} ext
 * @returns {Promise<string>}
 */
export async function storeMedia(storedPath: string, fileName: string, ext: string): Promise<string> {
  const hash: crypto.Hash = crypto.createHash('sha1')
  hash.update(fileName)
  fileName = hash.digest('hex')

  const filepath = path.join(__dirname, `/../../../uploads/${fileName}.${ext}`)

  await rename(storedPath, filepath)

  return filepath
}

/**
 * Store a record of the media
 * @param imagePath
 * @param {string} mimetype
 * @param {IStory} story
 * @returns {Promise<IMedia>}
 */
export async function storeMediaRecord(imagePath: string, mimetype: string, story: IStory): Promise<IMedia> {
  const media: IMedia = await models.Media.create({path: imagePath, mimetype: mimetype, story: story._id})

  story.media = media._id
  await media.save()

  return media
}

/**
 * Return a record of a media item
 * @param {module:mongoose.Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
  return await models.Media.findOne({_id: id})
}
