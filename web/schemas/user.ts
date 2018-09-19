import {Schema, Document} from 'mongoose'
import {IStory} from "./story";
import models from "../models";

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
  // Properties
  username: string
  password: string
  iv: string
  stories: Schema.Types.ObjectId[]
  admin: boolean
  createdAt: string
  updatedAt: string

  // Functions
  getStories(): Promise<IStory[]>
}

export const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  stories: [{
    type: Schema.Types.ObjectId,
    ref: 'Story'
  }],
  iv: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  }
}, schemaOptions)

/**
 * Get all of a user's stories
 * @returns {Promise<IStory[]>}
 */
UserSchema.methods.getStories = async function(): Promise<IStory[]> {
  return await models.Story.find({_id: { $in: this.stories}})
}
