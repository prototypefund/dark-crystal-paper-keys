const { describe } = require('tape-plus')
const crypto = require('crypto')
const paperKeys = require('..')
const tmpDir = require('tmp').dirSync
const path = require('path')
const fs = require('fs')

describe('basic', (context) => {
  context('write a pdf file', (assert, next) => {
    const filename = path.join(tmpDir().name, 'keys.pdf')
    const keys = [
      {
        name: 'My important key',
        data: crypto.randomBytes(32)
      },
      {
        name: 'Another important key',
        data: crypto.randomBytes(32)
      }
    ]

    paperKeys.createPdf(filename, keys, (err) => {
      assert.error(err, 'No error')
      fs.stat(filename, (err, statObj) => {
        assert.error(err, 'No error')
        assert.ok(statObj, 'PDF File exists')
        paperKeys.removePdf(filename)
          .then(() => {
            fs.stat(filename, (err, statObj) => {
              assert.ok(err, 'PDF File deleted')
              next()
            })
          })
          .catch((err) => {
            assert.error(err, 'No error')
          })
      })
    })
  })
})
