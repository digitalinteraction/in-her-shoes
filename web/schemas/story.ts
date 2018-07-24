import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IStory extends Document {
  user: Schema.Types.ObjectId
  story?: string
  start?: string
  end?: string
  messageStranger?: string
  thankYouNote?: string
  expenses?: object
  photoPath?: string
  isBeingModerated: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export const StorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  story: {
    type: String,
  },
  start: {
    type: String
  },
  end: {
    type: String
  },
  messageStranger: {
    type: String
  },
  thankYouNote: {
    type: String
  },
  expenses: {
    type: String
  },
  photoPath: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false,
    required: true
  },
  isBeingModerated: {
    type: Boolean,
    default: true,
    required: true
  }
}, schemaOptions)
