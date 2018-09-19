import {IUser} from "../schemas/user";
import models from "../models";
import {IStory} from "../schemas/story";
import {Schema} from "mongoose";
import { IPosition } from '../schemas/position'
import { getStartAndEndPositions } from '../controllers/position'

/**
 * Store a story
 * @param {{story?: string; start?: string; end?: string; messageStranger?: string; thankYouNote?: string; phoToPath?: string; user?: Schema.Types.ObjectId}} storyData
 * @param {IUser} user
 * @returns {Promise<IStory>}
 */
export async function storeStory(storyData: {
  story?: string,
  start?: string,
  end?: string,
  messageStranger?: string,
  thankYouNote?: string,
  phoToPath?: string,
  user?: Schema.Types.ObjectId
}, user?: IUser): Promise<IStory> {
  const story: IStory = await models.Story.create({
    story: storyData.story,
    start: storyData.start,
    end: storyData.end,
    messageStranger: storyData.messageStranger,
    thankYouNote: storyData.thankYouNote,
    photoToPath: storyData.phoToPath
  })

  if (user) {
    story.user = user._id
    await story.save()
  }

  if (story.start && story.end) {
    const positions: IPosition[] = await getStartAndEndPositions(story.start, story.end)
    story.startPosition = positions[0]._id
    story.endPosition = positions[1]._id

    await story.save()
  }

  return story
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
  phoToPath?: string,
  startPosition?: Schema.Types.ObjectId,
  endPosition?: Schema.Types.ObjectId
}, id: Schema.Types.ObjectId): Promise<IStory> {
  if (storyData.start && storyData.end) {
    const positions: IPosition[] = await getStartAndEndPositions(storyData.start, storyData.end)
    storyData.startPosition = positions[0]._id
    storyData.endPosition = positions[1]._id
  }

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

/**
 * Get all of a user's stories
 * @param {IUser} user
 * @returns {Promise<IStory[]>}
 */
export async function getUserStories(user: IUser): Promise<IStory[]> {
  return await models.Story.find({_id: { $in: user.stories }})
}

/**
 * Get all public stories
 * @return {Promise<IStory[]>}
 */
export async function getPublicStories(): Promise<IStory[]> {
  return await models.Story.find({}).where({'isPublished': true})
}

/**
 * Get all stories that are being moderated
 * @return {Promise<IStory>[]}
 */
export async function getUnpublished(): Promise<IStory[]> {
  return await models.Story.find({isBeingModerated: true})
}
