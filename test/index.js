'use strict'

const path = require('path')
const pifyTape = require('tape-promise').default
const test = require('tape')
const pEvent = require('p-event')
const vFile = require('vinyl-file')
const Vinyl = require('vinyl')

const createPlugin = require('..')
const {SHARP_INFO} = createPlugin
const defaultComputeFileName = require('../lib/compute-file-name')
const resize = require('../lib/resize')

const src = path.join(__dirname, 'teacup-and-saucer.jpg')

const png500 = {
	maxWidth: 500,
	maxHeight: 500,
	format: 'png'
}
const jpeg700 = {
	maxWidth: 700,
	format: 'jpeg'
}

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)
const pTest = pifyTape(test)


pTest('emits erros on invalid input', async (t) => {
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
	t.ok(await pEvent(plugin, 'error'))

	const invalid2 = Object.assign({}, valid, {maxHeight: 'foo'})
	writeImmediate(invalid2)
	t.ok(await pEvent(plugin, 'error'))

	const invalid3 = Object.assign({}, valid, {format: 1})
	writeImmediate(invalid3)
	t.ok(await pEvent(plugin, 'error'))

	const invalid4 = Object.assign({}, valid, {withoutEnlargement: 'foo'})
	writeImmediate(invalid4)
	t.ok(await pEvent(plugin, 'error'))
})

pTest('skips directories', async (t) => {
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
})

pTest('1 file, 500x500 png', async (t) => {
	const plugin = createPlugin()
	const input = await vFile.read(src)
	input.scale = png500
	plugin.end(input)

	const output = await new Promise((resolve, reject) => {
		plugin.once('data', resolve)
		plugin.once('error', reject)
	})

	t.ok(isObj(output), 'no file')

	t.equal(output.cwd, input.cwd)
	t.equal(output.base, input.base)

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
})

pTest('1 file, 500x500 png, 700x? jpeg', async (t) => {
	const plugin = createPlugin()

	const in1 = await vFile.read(src)
	in1.scale = png500
	const in2 = await vFile.read(src)
	in2.scale = jpeg700

	setImmediate(() => plugin.write(in1))
	const out1 = await pEvent(plugin, 'data')

	setImmediate(() => plugin.end(in2))
	const out2 = await pEvent(plugin, 'data')

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
	t.ok(info2.height > 0)

	t.end()
})

test('defaultComputeFileName', (t) => {
	const c = defaultComputeFileName
	const file = new Vinyl({
		cwd: '/',
		base: '/foo/',
		path: '/foo/bar.xyz.tiff',
		contents: Buffer.alloc(1)
	})
	t.plan(4)

	const file1 = file.clone()
	file1[SHARP_INFO] = {
		format: 'png',
		width: 500,
		height: 429,
		size: 300000
	}
	const scale1 = {
		format: 'png',
		maxWidth: 500,
		maxHeight: 500
	}
	c(file1, scale1, (err, fileName) => {
		t.ifError(err)
		t.equal(fileName, 'bar.xyz.500w-500h.png')
	})

	const file2 = file.clone()
	file2[SHARP_INFO] = {
		format: 'jpeg',
		width: 350,
		height: 300,
		size: 80000
	}
	const scale2 = {
		format: 'jpeg',
		maxWidth: 700
	}
	c(file2, scale2, (err, fileName) => {
		t.ifError(err)
		t.equal(fileName, 'bar.xyz.700w.jpeg')
	})
})

pTest('formatOptions are passed to sharp', async (t) => {
	const file = await vFile.read(src)

	const file1 = file.clone()
	const scale1 = {
		format: 'webp',
		maxWidth: 100,
		formatOptions: {
			quality: 80
		},
		maxWidth: Number.MAX_SAFE_INTEGER
	}
	const defaultFileSize = await new Promise((res, rej) => resize(file1, scale1, (err, newFile1) => {
		if (err)
			rej(err)
		else
			res(newFile1[SHARP_INFO].size)
	}))

	const file2 = file.clone()
	const scale2 = {
		format: 'webp',
		maxWidth: 100,
		formatOptions: {
			quality: 100
		},
		maxWidth: Number.MAX_SAFE_INTEGER
	}

	await new Promise((res, rej) => resize(file2, scale2, (err, newFile2) => {
		if (err)
			rej(err)
		else {
			t.ok(newFile2[SHARP_INFO].size > defaultFileSize)
			res()
		}
	}));

	t.end()
})

// todo: >1 files
