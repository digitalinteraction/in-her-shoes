import { IStory } from '../../web/schemas/story'
import { getUnpublished } from '../../web/controllers/story'
import { expect } from 'chai'
import { storeUser, destroyUser } from '../../web/controllers/user'
import { IUser } from '../../web/schemas/user'
import { generateToken } from '../../web/controllers/auth'
import Axios, { AxiosResponse, AxiosError } from 'axios'
import {URL} from '../commons'

describe('Admin', function () {
  let user: IUser
  let token: string
  before(async function () {
    user = await storeUser('tester-admin', 'secret', true)
    token = generateToken(user)
  })

  after(async function () {
    await destroyUser(user._id)
  })

  describe('Controller', function () {
    describe('Get stories being moderated', function () {
      it('Should return all stories being moderated', function (done) {
        getUnpublished().then((stories: IStory[]) => {
          expect(stories[0].isBeingModerated).to.be.true
          done()
        })
      })
    })
  })

  describe('Middleware', function () {
    describe('Approve an admin', function () {
      it('Should allow an admin to access a protected route', function (done) {
        Axios.get(`${URL}/api/admin/unpublished`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })

    describe('Reject an admin', function () {
      let userNotAdmin: IUser
      let newToken: string
      before(async function () {
        userNotAdmin = await storeUser('tester-admin-no-perms', 'secret')
        newToken = generateToken(userNotAdmin)
      })

      after(async function () {
        await destroyUser(userNotAdmin._id)
      })

      it('Should reject an admin', function (done) {
        Axios.get(`${URL}/api/admin/unpublished`, { headers: { 'x-access-token': newToken } })
        .then()
        .catch((error: AxiosError) => {
          expect(error.response.status).to.equal(403)
          done()
        })
      })
    })
  })

  describe('API', function () {
    describe('Get all moderated stories', function () {
      it('Should return all moderated stories', function (done) {
        Axios.get(`${URL}/api/admin/unpublished`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })
  })
})
