'use strict'

const path = require('path')
const PluginError = require('plugin-error')
const through = require('through2')

const resize = require('./lib/resize')
const SHARP_INFO = require('./lib/sharp-info')
const defaultComputeFileName = require('./lib/compute-file-name')
const pkgName = require('./package.json').name

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

const createScaleImagesPlugin = (computeFileName = defaultComputeFileName) => {
	const out = through.obj(function processFile(input, _, cb) {
		const onErr = (msg) => {
			const err = new PluginError(pkgName, {message: msg})
			err.file = input
			out.emit('error', err)
			cb()
		}

		if (!input || 'function' !== typeof input.isDirectory) {
			return onErr('invalid vinyl file passed')
		}
		if (input.isStream()) return onErr('streaming files are not supported')
		if (input.isDirectory()) return cb() // ignore directories

		const s = input.scale
		if (!isObj(s)) {
			return onErr('file.scale must be an object')
		}
		if (('maxWidth' in s) && 'number' !== typeof s.maxWidth) {
			return onErr('file.scale.maxWidth must be a number')
		}
		if (('maxHeight' in s) && 'number' !== typeof s.maxHeight) {
			return onErr('file.scale.maxHeight must be a number')
		}
		if (!('maxWidth' in s) && !('maxHeight' in s)) {
			return onErr('either file.scale.maxWidth or file.scale.maxHeight')
		}
		if (s.format && 'string' !== typeof s.format) {
			return onErr('file.scale.format must be a string')
		}
		if (s.fit && 'string' !== typeof s.format) {
			return onErr('file.scale.fit must be a string')
		}
		if (s.withoutEnlargement && 'boolean' !== typeof s.withoutEnlargement) {
			return onErr('file.scale.withoutEnlargement must be a boolean')
		}

		const self = this
		resize(input, input.scale, (err, output) => {
			if (err) {
				out.emit('error', err)
				return cb()
			}

			computeFileName(output, input.scale, (err, fileName) => {
				if (err) {
					out.emit('error', err)
					return cb()
				}

				const parsedPath = path.parse(output.path)
				parsedPath.base = fileName
				output.path = path.format(parsedPath)
				self.push(output)
				cb()
			})
		})
	})

	return out
}

createScaleImagesPlugin.SHARP_INFO = SHARP_INFO
module.exports = createScaleImagesPlugin
