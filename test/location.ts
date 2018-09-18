import {expect} from 'chai'
import { getGeocodeFromCity } from './../web/controllers/position'
import { IPosition } from './../web/schemas/position'

describe('Location', function() {
  describe('Get position for a city', function() {
    it('Should return a position from an API call', function(done) {
      getGeocodeFromCity('cork,ireland').then((position: IPosition) => {
          expect(position.lat).to.equal(51.8985143)
          expect(position.lng).to.equal(-8.4756035)
          done()
      })
    })
  })
})
