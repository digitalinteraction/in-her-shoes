import {IUser} from "../schemas/user";
import models from "../models";
import {IStory} from "../schemas/story";
import {Schema} from "mongoose";

/**
 * Store a story
 * @param {{story?: string; start?: string; end?: string; messageStranger?: string; thankYouNote?: string; phoToPath?: string; user?: Schema.Types.ObjectId}} storyData
 * @param {IUser} user
 * @returns {Promise<IStory>}
 */
export function storeStory(storyData: {
  story?: string,
  start?: string,
  end?: string,
  messageStranger?: string,
  thankYouNote?: string,
  phoToPath?: string,
  user?: Schema.Types.ObjectId
}, user?: IUser): Promise<IStory> {
  if (user) {
    storyData.user = user._id
  }
  return models.Story.create({
    story: storyData.story,
    start: storyData.start,
    end: storyData.end,
    messageStranger: storyData.messageStranger,
    thankYouNote: storyData.thankYouNote,
    photoToPath: storyData.phoToPath
  })
}

/**
 * Update a story
 * @param {{story?: string; start?: string; end?: string; messageStranger?: string; thankYouNote?: string; phoToPath?: string}} storyData
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IStory>}
 */
export async function updateStory(storyData: {
  story?: string,
  start?: string,
  end?: string,
  messageStranger?: string,
  thankYouNote?: string,
  phoToPath?: string
}, id: Schema.Types.ObjectId): Promise<IStory> {
  await models.Story.update({_id: id}, storyData)
  return await getStory(id)
}

/**
 * Get a story by ID
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IStory>}
 */
export async function getStory(id: Schema.Types.ObjectId): Promise<IStory> {
  return models.Story.findOne({_id: id})
}

/**
 * Destroy a story
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<void>}
 */
export async function destroyStory(id: Schema.Types.ObjectId): Promise<void> {
  return models.Story.deleteOne({_id: id})
}