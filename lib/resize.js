'use strict'

const sharp = require('sharp')

const SHARP_INFO = require('./sharp-info')

// todo: move this into a lib
// todo: image operations? http://sharp.pixelplumbing.com/en/stable/api-operation/
// todo: ignoreAspectRatio?

const resize = (file, cfg, cb) => {
	const task = sharp(file.contents)
	var opts = {
		withoutEnlargement: !cfg.allowEnlargement,
	}
	if (cfg.fit) opts.fit = cfg.fit
	task.resize(cfg.maxWidth, cfg.maxHeight || null, opts)
	if (cfg.format) task.toFormat(cfg.format, cfg.formatOptions)

	task.toBuffer((err, data, info) => {
		if (err) return cb(err)

		const newFile = file.clone({contents: false})
		newFile.contents = data
		Object.defineProperty(newFile, SHARP_INFO, {value: info})
		cb(null, newFile)
	})
}

module.exports = resize
