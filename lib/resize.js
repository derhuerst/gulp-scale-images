'use strict'

const sharp = require('sharp')

const SHARP_INFO = Symbol('sharp resize info')

// todo: move this into a lib
// todo: image operations? http://sharp.pixelplumbing.com/en/stable/api-operation/
// todo: ignoreAspectRatio?

const resize = (file, cfg, cb) => {
	const task = sharp(file.contents)
	task.resize(cfg.maxWidth, cfg.maxHeight)
	task.max()
	if (cfg.format) task.toFormat(cfg.format)
	task.withoutEnlargement(!cfg.allowEnlargement)

	task.toBuffer((err, data, info) => {
		if (err) return cb(err)

		const newFile = file.clone({contents: false})
		newFile.contents = data
		Object.defineProperty(newFile, SHARP_INFO, {value: info})
		cb(null, newFile)
	})
}

resize.SHARP_INFO = SHARP_INFO
module.exports = resize
