import * as data from './../../seed/seed-data.json'
import { IUser } from '../web/schemas/user'
import { IStory } from '../web/schemas/story'
import { storeUser} from '../web/controllers/auth'
import { storeStory } from '../web/controllers/story'
import * as mongoose from "mongoose";
import {storeExpense} from "../web/controllers/expense"

/**
 * Store a user and generate a token
 * @return {string} jwt token
 */
async function getUser(): Promise<IUser> {
  return await storeUser('tester-user', 'secret')
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

  await storeExpense(story._id, {
    procedure: storyData.expenses.procedure,
    travel: storyData.expenses.travel,
    food: storyData.expenses.food,
    childcare: storyData.expenses.childcare,
    accommodation: storyData.expenses.accommodation,
    other: storyData.expenses.other,
    paidDaysMissed: storyData.expenses.paidDaysMissed
  })

  return story
}

const main = async () => {
  mongoose.connect(process.env.MONGO_URI)
  console.log(data.stories.length)

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
