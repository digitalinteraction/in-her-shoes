import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IPosition extends Document {
  lat: Schema.Types.ObjectId
  lng: number,
  gid: number,
  textAddress: string
  updatedAt: string
}

export const PositionSchema = new Schema({
  lat: {
    type: Number,
    required: true,
    unique: true
  },
  lng: {
    type: Number,
    required: true,
    unique: true
  },
  gid: {
    type: String,
    required: true,
    unique: true
  },
  textAddress: {
    type: String,
    required: true,
    unique: true
  }
}, schemaOptions)
