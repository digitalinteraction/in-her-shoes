import {storeMedia} from "../web/controllers/media";
import * as path from "path";
import * as fs from "fs";
import {expect} from 'chai'
import {promisify} from "util";
import * as FormData from 'form-data'
import Axios, {AxiosError, AxiosResponse} from "axios";
import {URL} from "./commons";
import { generateToken } from "../web/controllers/auth";
import { destroyUser, storeUser } from '../web/controllers/user'
import {IUser} from "../web/schemas/user";
import {IStory} from "../web/schemas/story";
import {destroyStory, storeStory} from "../web/controllers/story";

const rename = promisify(fs.rename)
let testFilePath: string

describe('Media', function () {
  let user: IUser
  let token: string
  let story: IStory

  before(async () => {
    user = await storeUser('tester-media', 'secret')
    story = await storeStory({story: 'this is a story'}, user)
    token = await generateToken(user)
  })

  after (async () => {
    await destroyUser(user._id)
    await destroyStory(story._id)
  })

  describe('Store media', function () {
    it('Should store a file in the uploads folder', function (done) {
      storeMedia(path.join(__dirname, '../../test.jpg'), 'test.jpg', 'jpg').then((filepath: string) => {
        testFilePath = filepath
        expect(fs.existsSync(filepath)).to.be.true
        done()
      })
    })

    after (async () => {
      await rename(testFilePath, path.join(__dirname, '../../test.jpg'))
    })
  })

  // https://stackoverflow.com/questions/43013858/ajax-post-a-file-from-a-form-with-axios
  describe('Upload media', function () {
    it('Should post and store data', function (done) {
      let formData = new FormData()
      const file = fs.createReadStream(path.join(__dirname, '../../test.jpg'))
      formData.append("file", file)

      Axios.post(`${URL}/api/media/upload`, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          'x-access-token': token,
          'storyId': story._id
        }
      }).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        expect(fs.existsSync(response.data.payload.path)).to.be.true
        done()
      }).catch((error: AxiosError) => {
        console.log(error)
        throw error
      })
    })
  })
})
