import mongoose = require('mongoose')
import {IUser, UserSchema} from './schemas/user'
import {IStory, StorySchema} from "./schemas/story"

// Export models
export default {
  User: mongoose.model<IUser>('User', UserSchema),
  Story: mongoose.model<IStory>('Story', StorySchema)
}
