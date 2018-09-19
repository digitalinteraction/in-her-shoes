import {destroyExpense, editExpense, getExpense, storeExpense} from "../../web/controllers/expense";
import {IUser} from "../../web/schemas/user";
import {IStory} from "../../web/schemas/story";
import { generateToken } from "../../web/controllers/auth";
import { destroyUser, storeUser } from '../../web/controllers/user'
import {destroyStory, storeStory} from "../../web/controllers/story";
import {IExpense} from "../../web/schemas/expense";
import {expect, assert} from 'chai'
import Axios, {AxiosResponse} from "axios";
import {URL} from "../commons";

describe('Expense', function () {
  describe('Controller', function () {
    let user: IUser
    let story: IStory
    let token: string
    let expense: IExpense

    before( async function () {
      const storyData = {
        story: 'This is some text',
        start: 'Ireland',
        end: 'UK',
        message: 'This is a message'
      }

      user = await storeUser('tester-expense', 'secret')
      token = generateToken(user)
      story = await storeStory(storyData, user)
    })

    after(async function () {
      await destroyStory(story._id)
      await destroyUser(user._id)
    })

    describe('Store Expense', function () {
      it('should store and expense', function (done) {
        storeExpense(story._id, {
          procedure: 100,
          travel: 300,
          childcare: 10
        }).then((storedExpense: IExpense) => {
          expect(storedExpense.procedure).to.equal(100)
          expense = storedExpense
          done()
        })
      })
    })

    describe('Get an expense', function () {
      it('should get an expense from the database', function (done) {
        getExpense(expense._id).then((storedExpense) => {
          assert.isTrue(storedExpense.equals(expense))
          done()
        })
      })
    })

    describe('Edit an expense', function () {
      it('Update an expenses fields', function (done) {
        editExpense(expense._id, {
          procedure: 200
        }).then((storedExpense: IExpense) => {
          assert.equal(storedExpense.procedure, 200)
          done()
        })
      })
    })

    describe('Delete expense', function () {
      it('should destroy an expense and remove it from its parent story', function (done) {
        destroyExpense(expense._id).then(() => {
          expense.getStory().then((storedStory: IStory) => {
            assert.isNull(storedStory.expense)
            done()
          })
        })
      })
    })
  })

  describe('API', function () {
    let user: IUser
    let story: IStory
    let token: string

    before( async function () {
      const storyData = {
        story: 'This is some text',
        start: 'Ireland',
        end: 'UK',
        message: 'This is a message'
      }

      user = await storeUser('tester-expense', 'secret')
      token = generateToken(user)
      story = await storeStory(storyData, user)
    })

    after(async function () {
      await destroyStory(story._id)
      await destroyUser(user._id)
    })

    describe('Upload an expense', function () {
      it('should upload and return an expense', function (done) {
        const expenseData = {
          procedure: 300,
          travel: 200,
          childcare: 100,
          storyId: story._id
        }
        Axios.post(`${URL}/api/story/expense/store`, expenseData, {headers:{'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          expect(response.data.payload.procedure).to.equal(300)
          done()
        })
      })
    })
  })
})
