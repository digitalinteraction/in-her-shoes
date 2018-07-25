import {destroyExpense, editExpense, getExpense, storeExpense} from "../web/controllers/expense";
import {IUser} from "../web/schemas/user";
import {IStory} from "../web/schemas/story";
import {destroyUser, generateToken, storeUser} from "../web/controllers/auth";
import {destroyStory, storeStory} from "../web/controllers/story";
import {IExpense} from "../web/schemas/expense";
import {expect, assert} from 'chai'

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
})