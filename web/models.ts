import * as mongoose from 'mongoose'
import { IUser, UserSchema } from './schemas/user'
import { IStory, StorySchema } from './schemas/story'
import { ExpenseSchema, IExpense } from './schemas/expense'
import { IMedia, MediaSchema } from './schemas/media'
import { IPosition, PositionSchema } from './schemas/position'

// Export models
export default {
  User: mongoose.model<IUser>('User', UserSchema),
  Story: mongoose.model<IStory>('Story', StorySchema),
  Expense: mongoose.model<IExpense>('Expense', ExpenseSchema),
  Media: mongoose.model<IMedia>('Media', MediaSchema),
  Position: mongoose.model<IPosition>('Position', PositionSchema)
}
