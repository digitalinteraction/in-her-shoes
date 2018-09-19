import {describe} from "mocha"
import Axios, {AxiosError, AxiosResponse} from "axios"
import {expect} from "chai"
import {URL} from "./../commons"
import {IUser} from "../../web/schemas/user";
import {destroyUser} from "../../web/controllers/user";

describe('Auth', function () {
  let user: IUser
  after(async function () {
    await destroyUser(user._id)
  })

  describe('Register', function () {
    it("Should register a user and return a token", function (done) {
      const userData = {
        username: 'tester',
        password: 'secret'
      }
      Axios.post(`${URL}/api/auth/register`, userData).then((response: AxiosResponse) => {
        expect(response.data.payload.token).to.have.length.above(10)
        user = response.data.payload.user
        done()
      })
    })
  })

  describe('Rejects creating existing account', function () {
    it("Should prevent the user from creating an account with an existing username", function (done) {
      const userData = {
        username: 'tester',
        password: 'secret'
      }
      Axios.post(`${URL}/api/auth/register`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(403)
        done()
      })
    })
  })

  describe('Authenticate', function () {
    it("Should return a JWT token", function (done) {
      const userData = {
        username: 'tester',
        password: 'secret'
      }
      Axios.post(`${URL}/api/auth/authenticate`, userData).then((response: AxiosResponse) => {
        expect(response.data.payload.token).to.have.length.above(10)
        done()
      })
    })
  })

  describe('Reject incorrect password', function () {
    it("Should reject request if invalid password is given", function (done) {
      const userData = {
        username: 'tester',
        password: 'password'
      }
      Axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(401)
        done()
      })
    })
  })

  describe('Reject incorrect username', function () {
    it("Should reject request if invalid username is given", function (done) {
      const userData = {
        username: 'tester1',
        password: 'secret'
      }
      Axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(401)
        done()
      })
    })
  })
})
