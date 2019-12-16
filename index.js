const markdownpdf = require('markdown-pdf')
const QRCode = require('qrcode')
const bip39 = require('bip39')
const skrub = require('skrub')
const path = require('path')
const tmp = require('tmp')

tmp.setGracefulCleanup()

async function createPdf (outputFile, keys, callback) {
  let markdown = '# Paper Keys\n---\n'
  const tmpObj = tmp.dirSync()

  const filenames = await Promise.all(keys.map(async (key, index) => {
    const filename = path.join(tmpObj.name, `${index}.png`)
    await QRCode.toFile(
      filename,
      [{ data: key.data, mode: 'byte' }],
      {}
    )
    markdown += `## ${key.name}\n![qrcode](${filename})\n`
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
  return bip39.mnemonicToEntropy(mnemonic) // Buffer.from 'hex' ?
}

module.exports = { createPdf, removePdf, mnemonicToKey }
