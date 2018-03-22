'use strict'

const path = require('path')
const vFile = require('vinyl-file')

const createPlugin = require('.')
const {SHARP_INFO} = createPlugin

const src = path.join(__dirname, 'test', 'teacup-and-saucer.jpg')
const input = vFile.readSync(src)

const png500 = {
	maxWidth: 500,
	maxHeight: 500,
	format: 'png'
}

const plugin = createPlugin([png500])

plugin.on('data', (output) => {
	console.log(output)
	console.log(output[SHARP_INFO])
})

plugin.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})

plugin.end(input) // write input
