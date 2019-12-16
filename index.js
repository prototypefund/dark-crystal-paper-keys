const markdownpdf = require('markdown-pdf')
const QRCode = require('qrcode')
const bip39 = require('bip39')
const skrub = require('skrub')
const tmp = require('tmp')
const path = require('path')
const assert = require('assert')

tmp.setGracefulCleanup()

async function createPdf (outputFile, keys, callback) {
  let markdown = '# Paper Keys\n---\n'
  const tmpObj = tmp.dirSync()

  const filenames = await Promise.all(keys.map(async (key, index) => {
    const filename = path.join(tmpObj.name, `${index}.png`)
    const data = isHexString(key.data) ? Buffer.from(key.data, 'hex') : key.data
    assert(Buffer.isBuffer(data))
    await QRCode.toFile(
      filename,
      [{ data, mode: 'byte' }],
      {}
    )
    markdown += `## ${key.name}\n![qrcode](${filename})\n`
    if (key.comment) markdown += `${key.comment}\n`
    markdown += `${bip39.entropyToMnemonic(key.data)}\n---\n`
    return filename
  }))

  markdownpdf().from.string(markdown).to(outputFile, async () => {
    await Promise.all(filenames.map(async (file) => {
      try {
        await skrub(file, {})
      } catch (err) {
        // what to do here
        return callback(err)
      }
      tmpObj.removeCallback()
      callback()
    }))
  })
}

function removePdf (filePath) {
  return skrub(filePath, {})
}

function mnemonicToKey (mnemonic) {
  return Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex')
}

function isHexString (thing, length) {
  if (typeof thing !== 'string') return false
  if (length && (thing.length !== length)) return false
  return RegExp('[0-9a-fA-F]+').test(thing)
}

module.exports = { createPdf, removePdf, mnemonicToKey }
