import { IUser } from '../web/schemas/user'
import { IStory } from '../web/schemas/story'
import { storeUser} from '../web/controllers/user'
import { storeStory } from '../web/controllers/story'
import * as mongoose from "mongoose";
import {storeExpense} from "../web/controllers/expense"
import * as dotenv from 'dotenv'
dotenv.load()

const data = require('./seed_data').data

/**
 * Store a user and generate a token
 * @return {string} jwt token
 */
async function getUser(): Promise<IUser> {
  return await storeUser('seed', 'secret')
}

async function addStory(storyData: any, user: IUser): Promise<IStory> {
  const story: IStory = await storeStory({
    story: storyData.story,
    start: storyData.start,
    end: storyData.end,
    messageStranger: storyData.messageStranger,
    thankYouNote: storyData.thankYouNote,
    user: user._id
  }, user)

  story.isBeingModerated = false
  story.isPublished = true

  await story.save()

  await storeExpense(story._id, {
    procedure: storyData.expenses.procedure,
    travel: storyData.expenses.travel,
    food: storyData.expenses.food,
    childcare: storyData.expenses.childcare,
    accommodation: storyData.expenses.accommodation,
    other: storyData.expenses.other,
    paidDaysMissed: storyData.expenses.paidDaysMissed,
    currency: storyData.expenses.currency
  })

  return story
}

const main = async () => {
  mongoose.connect(process.env.MONGO_URI)
  console.log(data)

  let user: IUser
  try {
    user = await getUser()
  } catch (e) {
    console.error(e)
  }
  console.log(user)

  for (let i = 0; i < data.stories.length; i++) {
    console.log('looping through stories')

    try {
      const story = await addStory(data.stories[i], user)
      console.log(story)
    } catch (e) {
      console.error(e)
    }
  }
}

main()
