'use strict'

const path = require('path')
const pifyTape = require('tape-promise').default
const test = require('tape')
const co = require('co')
const vFile = require('vinyl-file')

const createPlugin = require('..')
const {SHARP_INFO} = createPlugin

const src = path.join(__dirname, 'teacup-and-saucer.jpg')

const png500 = {
	maxWidth: 500,
	maxHeight: 500,
	format: 'png'
}
const jpeg700 = {
	maxWidth: 700,
	maxHeight: 700,
	format: 'jpeg'
}

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)
const pTest = pifyTape(test)

test('throws on invalid usage', (t) => {
	const valid = {
		maxWidth: 500,
		maxHeight: 500,
		format: 'jpeg',
		withoutEnlargement: false
	}
	const invalid1 = Object.assign({}, valid, {maxWidth: 'foo'})
	const invalid2 = Object.assign({}, valid, {maxHeight: 'foo'})
	const invalid3 = Object.assign({}, valid, {format: 1})
	const invalid4 = Object.assign({}, valid, {withoutEnlargement: 'foo'})

	t.throws(() => createPlugin())
	t.throws(() => createPlugin({}))
	t.throws(() => createPlugin([]))
	t.throws(() => createPlugin(['foo']))
	t.throws(() => createPlugin([{}]))
	t.throws(() => createPlugin([invalid1]))
	t.throws(() => createPlugin([invalid2]))
	t.throws(() => createPlugin([invalid3]))
	t.throws(() => createPlugin([invalid4]))
	t.throws(() => createPlugin([valid, invalid1]))
	t.end()
})

pTest('1 file, 500px png', co.wrap(function* (t) {
	const plugin = createPlugin([png500])
	const input = yield vFile.read(src)

	plugin.on('data', (output) => {
		t.ok(isObj(output), 'no file')

		t.equal(output.cwd, input.cwd)
		t.equal(output.base, input.base)
		t.equal(output.path, input.path)
		t.equal(output.relative, input.relative)

		t.ok(Buffer.isBuffer(output.contents), 'output.contents must be a buffer')
		t.ok(output.contents.byteLength > 0, 'output.contents must be filled')

		const info = output[SHARP_INFO]
		t.ok(isObj(info))
		t.equal(typeof info.size, 'number')
		t.ok(info.size >= 0)

		// image is landscape, so width will be maxed out
		t.equal(info.width, png500.maxWidth)
		t.equal(typeof info.height, 'number')
		t.ok(info.height <= png500.maxHeight)

		t.end()
	})

	plugin.end(input) // write input
}))

pTest('1 file, 500px png, 700px jpeg', co.wrap(function* (t) {
	const plugin = createPlugin([png500, jpeg700])

	let hasPng = false, hasJpeg = false
	plugin.on('data', (output) => {
		t.ok(isObj(output), 'no file')

		t.ok(Buffer.isBuffer(output.contents), 'output.contents must be a buffer')
		t.ok(output.contents.byteLength > 0, 'output.contents must be filled')

		const info = output[SHARP_INFO]
		t.ok(isObj(info))
		t.equal(typeof info.size, 'number')
		t.ok(info.size >= 0)

		// image is landscape, so width will be maxed out
		if (info.format === 'png') {
			if (hasPng) t.fail('png emitted twice')
			hasPng = true
			t.equal(info.width, png500.maxWidth)
			t.equal(typeof info.height, 'number')
			t.ok(info.height <= png500.maxHeight)
		} else if (info.format === 'jpeg') {
			if (hasJpeg) t.fail('jpeg emitted twice')
			hasJpeg = true
			t.equal(info.width, jpeg700.maxWidth)
			t.equal(typeof info.height, 'number')
			t.ok(info.height <= jpeg700.maxHeight)
		} else t.fail('invalid format ' + info.format)

		if (hasPng && hasJpeg) t.end()
	})

	plugin.end(yield vFile.read(src)) // write input
}))

// todo: >1 profiles
