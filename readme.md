# gulp-scale-images

**[Gulp](https://gulpjs.com) plugin to make each image smaller. Combined with [`flat-map`](https://npmjs.com/package/flat-map), you can create multiple variantes per image**, which is useful for [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images).

[![npm version](https://img.shields.io/npm/v/gulp-scale-images.svg)](https://www.npmjs.com/package/gulp-scale-images)
[![build status](https://api.travis-ci.org/derhuerst/gulp-scale-images.svg?branch=master)](https://travis-ci.org/derhuerst/gulp-scale-images)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/gulp-scale-images.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Similar libraries

Some similar libraries and why I think this one is better.

- [`gulp-image-resize`](https://www.npmjs.com/package/gulp-image-resize)
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
	- supports only one scale instruction
- [`gulp-sharp`](https://www.npmjs.com/package/gulp-sharp)
	- is not being maintained
	- has no tests
	- supports only one scale instruction
- [`gulp-retinize`](https://www.npmjs.com/package/gulp-retinize)
	- doesn't seem to be maintained
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
	- only works for files on disk
	- supports only one scale instruction
- [`gulp-imgconv`](https://www.npmjs.com/package/gulp-imgconv)
	- has no tests
	- supports only one scale instruction
- [`gulp-inline-resize`](https://www.npmjs.com/package/gulp-inline-resize)
	- doesn't do *one thing*
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
- [`gupl-unretina`](https://www.npmjs.com/package/gupl-unretina)
	- less flexible
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
- [`gulp-gm-limit`](https://www.npmjs.com/package/gulp-gm-limit)
	- doesn't seem to be maintained
	- supports only one scale instruction
- [`gulp-imgresize`](https://www.npmjs.com/package/gulp-imgresize)
	- no documentation
	- is not being maintained
	- has no tests


## Installing

```shell
npm install gulp-scale-images --save-dev
```


## Usage

`gulp-scale-images` expects the instructions for each file to be in `file.scale`. They may look like this:

```js
{
	maxWidth: 300, // maximum width, respecting the aspect ratio
	maxHeight: 400, // maximum height, respecting the aspect ratio
	format: 'jpeg', // optional, one of ('jpeg', 'png', 'webp')
	withoutEnlargement: false // optional, default is true
}
```

An example:

```js
const gulp = require('gulp')
const flatMap = require('flat-map').default
const scaleImages = require('gulp-scale-images')

const twoVariantsPerFile = (file, cb) => {
	const pngFile = file.clone()
	pngFile.scale = png500
	const jpegFile = file.clone()
	jpegFile.scale = jpeg700
	cb(null, [pngFile, jpegFile])
}

gulp.task('default', () => {
	return gulp.src('src/*.{jpeg,jpg,png,gif}')
	.pipe(flatMap(twoVariantsPerFile))
	.pipe(scaleImages())
	.pipe(gulp.dest('dist'))
})
```

### Definining scale instructions based on metadata

```js
const readMetadata = require('gulp-scale-images/read-metadata')
const through = require('through2')
const scaleImages = require('gulp-scale-images')

const computeScaleInstructions = (file, _, cb) => {
	readMetadata(file.path, (err, meta) => {
		if (err) return cb(err)
		file.scale = {
			maxWidth: Math.floor(meta.width / 2),
			maxHeight: Math.floor(meta.height / 2)
		}
		cb(null, scale)
	})
}

// gulp.src(…)
.pipe(through.obj(computeScaleInstructions))
.pipe(scaleImages())
// gulp.dest(…)
```

### Custom scaled file names

By default, `gulp-scale-images` will use `{basename}.{maxWidth}w-{maxHeight}h.{format}` (e.g. `foo.500w-300h.jpeg`). You can define a custom logic though:

```js
const path = require('path')
const scaleImages = require('gulp-scale-images')

const computeFileName = (output, scale, cb) => {
	const fileName = [
		path.basename(output.path, output.extname), // strip extension
		scale.maxWidth + 'w',
		scale.format || output.extname
	].join('.')
}

// …
// scaleImages(computeFileName)
// …
```

### `gulp-scale-images` works well with

- [`flat-map`](https://www.npmjs.com/package/flat-map) – A flat map implementation for node streams. (One chunk in, `n` chunks out.)
- [`replace-ext`](https://www.npmjs.com/package/replace-ext) – Replaces a file extension with another one.


## Contributing

If you have a question or have difficulties using `gulp-scale-images`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/gulp-scale-images/issues).
