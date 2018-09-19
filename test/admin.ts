import { IStory } from '../web/schemas/story'
import { getUnpublished } from '../web/controllers/story'
import { expect } from 'chai'

describe('Admin', function () {
  describe('Get stories being moderated', function () {
    it('Should return all stories being moderated', function (done) {
      getUnpublished().then((stories: IStory[]) => {
        expect(stories[0].isBeingModerated).to.be.true
        done()
      })
    })
  })
})
