'use strict'

const path = require('path')

const defaultComputeFileName = (output, scale, cb) => {
	const suffix = []
	if (scale.maxWidth) suffix.push(scale.maxWidth + 'w')
	if (scale.maxHeight) suffix.push(scale.maxHeight + 'h')

	const fileName = [path.basename(output.path, output.extname)]
	if (suffix.length > 0) fileName.push(suffix.join('-'))
	fileName.push(scale.format || output.extname)

	cb(null, fileName.join('.'))
}

module.exports = defaultComputeFileName
