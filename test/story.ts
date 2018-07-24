import {IUser} from "../web/schemas/user"
import {destroyUser, generateToken, storeUser} from "../web/controllers/auth"
import {IStory} from "../web/schemas/story"
import {assert} from 'chai'
import {destroyStory, getStory, storeStory, updateStory} from "../web/controllers/story"

let user: IUser
let token: string

describe('Story', function () {
  let story: IStory

  before(async function () {
    user = await storeUser('tester-story', 'secret')
    token = generateToken(user)
  })

  after( async function () {
    await destroyUser(user._id)
  })

  describe('Controller', function () {
    describe('Store a story', function () {
      it('should store a story in the database', function (done) {
        const storyData = {
          story: 'This is some text',
          start: 'Ireland',
          end: 'UK',
          message: 'This is a message'
        }

        storeStory(storyData, user).then((storedStory: IStory) => {
          assert.equal(storedStory.story, storyData.story)
          story = storedStory
          done()
        })
      })
    })

    describe('Get a story', function () {
      it('Should retrieve a story',function (done) {
        getStory(story._id).then((stored: IStory) => {
          assert.isTrue(stored.equals(story))
          done()
        })
      })
    })

    describe('Edit a story', function () {
      it('Should update a story', function (done) {
        const storyData = {
          story: 'this is an updated story'
        }
        updateStory(storyData, story._id).then((updatedStory: IStory) => {
          assert.equal(storyData.story, updatedStory.story)
          done()
        })
      })
    })

    describe('Delete a story', function () {
      it('Should delete a story', function (done) {
        destroyStory(story._id).then(() => {
          getStory(story._id).then((stored) => {
            assert.isTrue(stored === null)
            done()
          })
        })
      })
    })
  })
})