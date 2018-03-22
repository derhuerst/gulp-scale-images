'use strict'

const sharp = require('sharp')

const readMetadata = (file, cb) => {
	sharp(file.contents)
	.metadata()
	.then(meta => cb(null, meta))
	.catch(cb)
}

module.exports = readMetadata
