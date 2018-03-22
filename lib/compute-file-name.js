'use strict'

const path = require('path')

const SHARP_INFO = require('./sharp-info')

const defaultComputeFileName = (output, scale, cb) => {
	const result = output[SHARP_INFO]

	const suffix = []
	if (scale.maxWidth) suffix.push(result.width + 'w')
	if (scale.maxHeight) suffix.push(result.height + 'h')

	const fileName = [path.basename(output.path, output.extname)]
	if (suffix.length > 0) fileName.push(suffix.join('-'))
	fileName.push(scale.format || output.extname)

	cb(null, fileName.join('.'))
}

module.exports = defaultComputeFileName
