import {describe} from "mocha";
import Axios, {AxiosResponse} from "axios";
import {URL} from "./commons";
import {expect} from "chai";
import {IUser} from "../web/schemas/user";
import { generateToken } from "../web/controllers/auth";
import { destroyUser, storeUser } from '../web/controllers/user'

let user: IUser
let token: string

describe('User', function () {
  before(async function () {
    user = await storeUser('tester-user', 'secret')
    token = generateToken(user)
  })

  after( async function () {
    await destroyUser(user._id)
  })

  describe('Profile', function () {
    it('Should return the users information', function (done) {
      Axios.get(`${URL}/api/user/me`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.data.payload.user.username).to.equal('tester-user')
        done()
      })
    })
  })

  describe('Destroy', function () {
    it('Should delete users profile', function (done) {
      Axios.delete(`${URL}/api/user/destroy`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      })
    })
  })
})
