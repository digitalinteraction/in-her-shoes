import {Schema, Document} from 'mongoose'
import models from "../models";
import {IStory} from "./story";

const schemaOptions = {
  timestamps: true
}

export interface IExpense extends Document {
  // Properties
  story: Schema.Types.ObjectId
  procedure: number
  travel: number
  food: number
  childcare: number
  accommodation: number
  other: number
  paidDaysMissed: number
  currency: string

  // Functions
  getStory(): Promise<IStory>
}

export const ExpenseSchema = new Schema({
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  procedure: {
    type: Number,
    default: 0
  },
  travel: {
    type: Number,
    default: 0
  },
  food: {
    type: Number,
    default: 0
  },
  childcare: {
    type: Number,
    default: 0
  },
  accommodation: {
    type: Number,
    default: 0
  },
  other: {
    type: Number,
    default: 0
  },
  paidDaysMissed: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['£', '€']
  }
}, schemaOptions)

ExpenseSchema.methods.getStory = async function(): Promise<IStory> {
  return await models.Story.findOne({_id: this.story})
}
