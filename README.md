# Paper key export

For backing up cryptographic keys on paper.  Takes a array of keys with names and creates a PDF.

- mnemonics using BIP 39 (keys must be between 16 and 32 bytes)
- QR codes
- Removes files securely using [skrub](https://github.com/dawsbot/skrub)

## Example:
```js
const paperKeys = require('.')
const crypto = require('crypto')
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

paperKeys.createPdf('./key-backup.pdf', keys, (err) => {
  if (err) throw err
})
```

## Example PDF output:

![example](./example.png)

## API

### `createPdf (outputFile, keys, callback)`

creates a pdf `outputFile`.
- `keys` should be an array of objects of the form:
  - `name` - a string describing the key (may contain markdown formatting).
  - `data` - the key as a buffer or hex encoded string.
  - `comment` - an optional comment string to include (may contain markdown formatting). 

### `removePdf (filePath)`
Securely removes the given file.  Returns a promise.

### `mnemonicToKey (mnemonic)`
Turn a mnemonic back into a key. Takes a string, returns a buffer.
