import {describe} from "mocha";
import Axios, {AxiosError, AxiosResponse} from "axios";
import {URL} from "./commons";
import {expect} from "chai";
import {IUser} from "../web/schemas/user";
import { generateToken } from "../web/controllers/auth";
import { destroyUser, storeUser } from '../web/controllers/user'
import {IStory} from "../web/schemas/story";
import {destroyStory, storeStory} from "../web/controllers/story";

describe('Middleware', function () {
  describe('Authentication', function () {
    describe('Require token', function () {
      it("Should reject request if no token is given", function (done) {
        Axios.get(`${URL}/api/user/me`).then(() => {
        }).catch((error) => {
          expect(error.response.status).to.equal(401)
          done()
        })
      })
    })

    describe('Check token is valid', function () {
      it("Should reject request if the token is invalid", function (done) {
        const invToken = `0`
        Axios.get(`${URL}/api/user/me`, {headers: {'x-access-token': invToken}}).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401)
          done()
        })
      })
    })
  })

  describe('Owner', function () {
    let user: IUser
    let otherUser: IUser
    let otherToken: string
    let story: IStory

    before( async function () {
      user = await storeUser('tester-middleware', 'secret')
      otherUser = await storeUser('tester-malicious', 'secret')
      otherToken = generateToken(otherUser)
      story = await storeStory({story: 'this is a story'}, user)
    })

    after(async function () {
      await destroyStory(story.id)
      await destroyUser(user._id)
      await destroyUser(otherUser._id)
    })

    describe('Reject user accessing anothers story', function () {
      it('should reject a user editing someone elses story', function (done) {
        const storyData = {
          story: 'this is an edited story',
          storyId: story._id
        }

        Axios.post(`${URL}/api/story/edit`, storyData, {headers: {'x-access-token': otherToken}})
          .then()
          .catch((error: AxiosError) => {
            expect(error.response.status).to.equal(403)
            done()
        })
      })
    })

    describe('Abort if story does not exist', function () {
      it('should return a 404', function (done) {
        const storyData = {
          story: 'this is an edited story',
          storyId: '000000000000000000000000' // fake object id
        }

        Axios.post(`${URL}/api/story/edit`, storyData, {headers: {'x-access-token': otherToken}})
          .then()
          .catch((error: AxiosError) => {
            expect(error.response.status).to.equal(404)
            done()
          })
      })
    })
  })
})
