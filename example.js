'use strict'

const path = require('path')
const vFile = require('vinyl-file')
const flatMap = require('flat-map').default

const scaleImages = require('.')
const {SHARP_INFO} = scaleImages

const src = path.join(__dirname, 'test', 'teacup-and-saucer.jpg')
const input = vFile.readSync(src)

const png500 = {maxWidth: 500, maxHeight: 500, format: 'png'}
const jpeg700 = {maxWidth: 700, maxHeight: 700, format: 'jpeg'}

// per input file: 1 500px png, 1 700px jpeg
const mapper = flatMap((file, cb) => {
	const pngFile = file.clone()
	pngFile.scale = png500
	const jpegFile = file.clone()
	jpegFile.scale = jpeg700
	cb(null, [pngFile, jpegFile])
})

const plugin = mapper.pipe(scaleImages())
plugin.on('data', (output) => {
	console.log(output)
	console.log(output[SHARP_INFO])
})

plugin.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})

mapper.end(input) // write input file
