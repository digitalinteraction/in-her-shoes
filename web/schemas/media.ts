import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IMedia extends Document {
  story: Schema.Types.ObjectId
  path: string,
  mimetype: string,
  createdAt: string
  updatedAt: string
}

export const MediaSchema = new Schema({
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
}, schemaOptions)
