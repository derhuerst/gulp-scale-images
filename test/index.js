'use strict'

const path = require('path')
const pifyTape = require('tape-promise').default
const test = require('tape')
const co = require('co')
const pEvent = require('p-event')
const vFile = require('vinyl-file')
const Vinyl = require('vinyl')

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

pTest('emits erros on invalid input', co.wrap(function* (t) {
	const plugin = createPlugin()
	const writeImmediate = d => setImmediate(() => plugin.write(d))

	const valid = {
		maxWidth: 500,
		maxHeight: 500,
		format: 'jpeg',
		withoutEnlargement: false
	}

	const invalid1 = Object.assign({}, valid, {maxWidth: 'foo'})
	writeImmediate(invalid1)
	t.ok(yield pEvent(plugin, 'error'))

	const invalid2 = Object.assign({}, valid, {maxHeight: 'foo'})
	writeImmediate(invalid2)
	t.ok(yield pEvent(plugin, 'error'))

	const invalid3 = Object.assign({}, valid, {format: 1})
	writeImmediate(invalid3)
	t.ok(yield pEvent(plugin, 'error'))

	const invalid4 = Object.assign({}, valid, {withoutEnlargement: 'foo'})
	writeImmediate(invalid4)
	t.ok(yield pEvent(plugin, 'error'))

	t.end()
}))

pTest('skips directories', co.wrap(function* (t) {
	const plugin = createPlugin([png500])
	const dir = new Vinyl({
		path: __dirname,
		stat: {
			isDirectory: () => true,
			isFile: false
		}
	})

	plugin.on('data', (output) => {
		t.fail('dir came through')
	})

	plugin.on('end', (output) => {
		t.pass('ended')
		t.end()
	})
	plugin.end(dir)
}))

pTest('1 file, 500px png', co.wrap(function* (t) {
	const plugin = createPlugin()
	const input = yield vFile.read(src)
	input.scale = png500

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
	const plugin = createPlugin()

	const in1 = yield vFile.read(src)
	in1.scale = png500
	const in2 = yield vFile.read(src)
	in2.scale = jpeg700

	setImmediate(() => plugin.write(in1))
	const out1 = yield pEvent(plugin, 'data')

	setImmediate(() => plugin.end(in2))
	const out2 = yield pEvent(plugin, 'data')

	t.ok(isObj(out1), 'no file')
	t.ok(isObj(out2), 'no file')

	t.ok(Buffer.isBuffer(out1.contents), 'out1.contents must be a buffer')
	t.ok(out1.contents.byteLength > 0, 'out1.contents must be filled')
	t.ok(Buffer.isBuffer(out2.contents), 'out2.contents must be a buffer')
	t.ok(out2.contents.byteLength > 0, 'out2.contents must be filled')

	const info1 = out1[SHARP_INFO]
	t.ok(isObj(info1))
	t.equal(typeof info1.size, 'number')
	t.ok(info1.size >= 0)
	const info2 = out2[SHARP_INFO]
	t.ok(isObj(info2))
	t.equal(typeof info2.size, 'number')
	t.ok(info2.size >= 0)

	// image is landscape, so width will be maxed out
	t.equal(info1.width, png500.maxWidth)
	t.equal(typeof info1.height, 'number')
	t.ok(info1.height <= png500.maxHeight)
	t.equal(info2.width, jpeg700.maxWidth)
	t.equal(typeof info2.height, 'number')
	t.ok(info2.height <= jpeg700.maxHeight)

	t.end()
}))

// todo: >1 files
