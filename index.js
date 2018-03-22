'use strict'

const through = require('through2')
const eachSeries = require('async/eachSeries')

const resize = require('./lib/resize')

const isProduction = process.env.NODE_ENV === 'production'

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

const validateConfigs = (cfgs) => {
	if (!Array.isArray(cfgs)) throw new Error('configs must be an array')
	if (!cfgs.length) throw new Error('configs is empty')
	for (let cfg of cfgs) {
		if (!isObj(cfg)) throw new Error('cfg must be an object')
		if ('number' !== typeof cfg.maxWidth) {
			throw new Error('cfg.maxWidth must be a number')
		}
		if ('number' !== typeof cfg.maxHeight) {
			throw new Error('cfg.maxHeight must be a number')
		}
		if (cfg.format && 'string' !== typeof cfg.format) {
			throw new Error('cfg.format must be a string')
		}
		if (cfg.withoutEnlargement && 'boolean' !== typeof cfg.withoutEnlargement) {
			throw new Error('cfg.withoutEnlargement must be a boolean')
		}
	}
}

const createScaleImagesPlugin = (configs) => {
	if (!isProduction) validateConfigs(configs)

	const out = through.obj(function processFile(input, _, cb) {
		if (!input || 'function' !== typeof input.isDirectory) {
			const err = new Error('invalid vinyl file passed')
			err.file = input
			out.emit('error', err)
			cb()
			return
		}
		if (input.isDirectory()) { // ignore directories
			cb()
			return
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
