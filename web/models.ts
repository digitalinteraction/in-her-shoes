import {IUser, UserSchema} from './schemas/user'
import {IStory, StorySchema} from "./schemas/story"
import {ExpenseSchema, IExpense} from "./schemas/expense";
import * as mongoose from "mongoose";

// Export models
export default {
  User: mongoose.model<IUser>('User', UserSchema),
  Story: mongoose.model<IStory>('Story', StorySchema),
  Expense: mongoose.model<IExpense>('Expense', ExpenseSchema)
}
