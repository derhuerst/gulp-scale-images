'use strict'

const PluginError = require('plugin-error')
const through = require('through2')
const eachSeries = require('async/eachSeries')

const resize = require('./lib/resize')
const pkgName = require('./package.json').name

const isProduction = process.env.NODE_ENV === 'production'

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

const createErr = (msg, file) => {
	const err = new PluginError(pkgName, {message: msg})
	if (file) err.file = file
	return err
}

const validateConfigs = (cfgs) => {
	if (!Array.isArray(cfgs)) throw createErr('configs must be an array')
	if (!cfgs.length) throw createErr('configs is empty')
	for (let cfg of cfgs) {
		if (!isObj(cfg)) throw createErr('cfg must be an object')
		if ('number' !== typeof cfg.maxWidth) {
			throw createErr('cfg.maxWidth must be a number')
		}
		if ('number' !== typeof cfg.maxHeight) {
			throw createErr('cfg.maxHeight must be a number')
		}
		if (cfg.format && 'string' !== typeof cfg.format) {
			throw createErr('cfg.format must be a string')
		}
		if (cfg.withoutEnlargement && 'boolean' !== typeof cfg.withoutEnlargement) {
			throw createErr('cfg.withoutEnlargement must be a boolean')
		}
	}
}

const createScaleImagesPlugin = (configs) => {
	if (!isProduction) validateConfigs(configs)

	const out = through.obj(function processFile(input, _, cb) {
		if (!input || 'function' !== typeof input.isDirectory) {
			out.emit('error', createErr('invalid vinyl file passed', input))
			return cb()
		}
		if (input.isStream()) {
			out.emit('error', createErr('streaming files are not supported', input))
			return cb()
		}
		if (input.isDirectory()) { // ignore directories
			return cb()
		}

		const self = this
		const processConfig = (cfg, cb) => {
			resize(input, cfg, (err, output) => {
				if (err) return cb(err)
				self.push(output)
				cb()
			})
		}

		eachSeries(configs, processConfig, (err) => {
			if (err) {
				out.emit('error', err)
				cb(null)
				out.destroy()
			} else cb()
		})
	})

	return out
}

createScaleImagesPlugin.SHARP_INFO = resize.SHARP_INFO
module.exports = createScaleImagesPlugin
