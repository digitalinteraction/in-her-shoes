import {Schema} from "mongoose";
import models from "../models";
import {IExpense} from "../schemas/expense";
import {IStory} from "../schemas/story";

/**
 * Store and expense in the database
 * @param {Schema.Types.ObjectId} storyId
 * @param {{procedure?: number; travel?: number; food?: number; childcare?: number; accommodation?: number; other?: number; paidDaysMissed?: number}} expenseData
 * @returns {Promise<IExpense>}
 */
export async function storeExpense(storyId: Schema.Types.ObjectId, expenseData: {
  procedure?: number,
  travel?: number,
  food?: number,
  childcare?: number,
  accommodation?: number,
  other?: number,
  paidDaysMissed?: number,
  currency?: string
}): Promise<IExpense> {
  if (!storyId) {
    throw new Error('story id cannot be null')
  }

  return await models.Expense.create({
    procedure: expenseData.procedure || 0,
    travel: expenseData.travel || 0,
    food: expenseData.travel || 0,
    childcare: expenseData.childcare || 0,
    accommodation: expenseData.accommodation || 0,
    other: expenseData.other || 0,
    paidDaysMissed: expenseData.paidDaysMissed || 0,
    currency: expenseData.currency || '€',
    story: storyId
  })
}

/**
 * Get an expense from the database
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IExpense>}
 */
export async function getExpense(id: Schema.Types.ObjectId): Promise<IExpense> {
  return await models.Expense.findOne({_id: id})
}

export async function editExpense(id: Schema.Types.ObjectId, expenseData: {
  procedure?: number,
  travel?: number,
  food?: number,
  childcare?: number,
  accommodation?: number,
  other?: number,
  paidDaysMissed?: number,
  currency?: string
}): Promise<IExpense> {
  await models.Expense.update({_id: id}, expenseData)
  return await getExpense(id)
}

/**
 * Destroy an expense
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<void>}
 */
export async function destroyExpense(id: Schema.Types.ObjectId): Promise<void> {
  const expense: IExpense = await getExpense(id)
  const story: IStory = await expense.getStory()

  story.expense = null
  await story.save()

  return await models.Expense.deleteOne({_id: id})
}
