import { Schema, Document } from 'mongoose'
import models from "../models";
import {IExpense} from "./expense";

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
  expense?: Schema.Types.ObjectId
  photoPath?: string
  isBeingModerated: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string

  // Functions
  getExpense(): Promise<IExpense>
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
  expense: {
    type: Schema.Types.ObjectId,
    ref: 'Expense'
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

/**
 * Get the expense for a story instead of an mongo object id.
 * @returns {Promise<IExpense>}
 */
StorySchema.methods.getExpense = async function(): Promise<IExpense> {
  return await models.Expense.findOne({_id: this.expense})
}
