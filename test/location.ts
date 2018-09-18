import {expect} from 'chai'
import { getURL, getPosition } from './../web/controllers/location'
import { Position } from './../web/position'

describe('Location', function() {
  describe('Get position for a city', function() {
    it('Should return a position from an API call', function(done) {
      const url = getURL('cork,ireland')
      getPosition(url).then((position: Position) => {
          expect(position.lat).to.equal(51.8985143)
          expect(position.long).to.equal(-8.4756035)
          done()
      })
    })
  })
})
