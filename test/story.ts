import {IUser} from "../web/schemas/user"
import {destroyUser, generateToken, storeUser} from "../web/controllers/auth"
import {IStory} from "../web/schemas/story"
import {assert, expect} from 'chai'
import {destroyStory, getStory, storeStory, updateStory} from "../web/controllers/story"
import Axios, {AxiosResponse} from "axios";
import {URL} from "./commons";

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

  describe('API', function () {
    let story: IStory

    after(async function () {
      await destroyStory(story._id)
    })

    describe('Store a story', function () {
      it('Should return the users stories', function (done) {
        const storyData = {
          story: 'This is some text',
          start: 'Ireland',
          end: 'UK',
          message: 'This is a message'
        }

        Axios.post(`${URL}/api/story/store`, storyData, {headers: {'x-access-token': token}})
          .then((response: AxiosResponse) => {
            expect(response.status).to.equal(200)
            expect(response.data.payload.story).to.equal(storyData.story)
            story = response.data.payload
            done()
        })
      })
    })

    describe('Get user\'s stories', function () {
      it('Should return the users stories', function (done) {
        Axios.get(`${URL}/api/story/get`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          expect(response.data.payload.stories[0].story).to.equal('This is some text')
          done()
        })
      })
    })

    describe('Edit a story', function () {
      it('should update a story', function (done) {
        const storyData = {
          story: 'This is some updated text',
          start: 'Ireland',
          end: 'UK',
          message: 'This is a message',
          id: story._id
        }

        Axios.post(`${URL}/api/story/edit`, storyData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          expect(response.data.payload.story).to.equal(storyData.story)
          done()
        })
      })
    })

    describe('Destroy a story', function () {
      it('should remove the story from the database', function (done) {
        Axios.delete(`${URL}/api/story/destroy/${story._id}`, {headers:{'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          getStory(story._id).then((storedStory) => {
            assert.isNull(storedStory)
            done()
          })
        })
      })
    })
  })
})