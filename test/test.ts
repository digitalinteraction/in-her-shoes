import {expect} from 'chai'
import {describe} from 'mocha'
import {App} from "../web/server"
import Axios, {AxiosResponse} from 'axios'
import {Server} from 'http'
import {URL} from "./commons"

let server: Server

describe('Test', function () {
  // let server = null
  before(function () {
    const port: number = 8888
    process.env.TEST = 'true'

    try {
      server = new App().express.listen(port)
    } catch (e) {
      console.error(e)
    }
  })

  after(async function () {
    await server.close()
  })

  require('./modules/auth')
  require('./modules/user')
  require('./modules/middleware')
  require('./modules/story')
  require('./modules/expense')
  require('./modules/media')
  require('./modules/location')
  require('./modules/admin')

  // For the home routes.
  describe('Home', function () {
    // Test the landing page renders
    describe('Render', function () {
      it("Should return the home page from '/'", function (done) {
        Axios.get(`${URL}/`).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })
  })
})
