# gulp-scale-images

[![Greenkeeper badge](https://badges.greenkeeper.io/derhuerst/gulp-scale-images.svg)](https://greenkeeper.io/)

**[Gulp](https://gulpjs.com) plugin to resize each image into multiple smaller variants.** Useful for [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images).

[![npm version](https://img.shields.io/npm/v/gulp-scale-images.svg)](https://www.npmjs.com/package/gulp-scale-images)
[![build status](https://api.travis-ci.org/derhuerst/gulp-scale-images.svg?branch=master)](https://travis-ci.org/derhuerst/gulp-scale-images)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/gulp-scale-images.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Similar libraries

Some similar libraries and why I think this one is better.

- [`gulp-image-resize`](https://www.npmjs.com/package/gulp-image-resize)
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
	- supports only one config
- [`gulp-sharp`](https://www.npmjs.com/package/gulp-sharp)
	- is not being maintained
	- has no tests
	- supports only one config
- [`gulp-retinize`](https://www.npmjs.com/package/gulp-retinize)
	- doesn't seem to be maintained
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
	- only works for files on disk
	- supports only one config
- [`gulp-imgconv`](https://www.npmjs.com/package/gulp-imgconv)
	- has no tests
	- supports only one config
- [`gulp-inline-resize`](https://www.npmjs.com/package/gulp-inline-resize)
	- doesn't do *one thing*
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
- [`gupl-unretina`](https://www.npmjs.com/package/gupl-unretina)
	- less flexible
	- uses [`gm`](https://npmjs.com/package/gm) instead of [`sharp`](https://npmjs.com/package/sharp), requires `gm` to be installed
- [`gulp-gm-limit`](https://www.npmjs.com/package/gulp-gm-limit)
	- doesn't seem to be maintained
	- supports only one config
- [`gulp-imgresize`](https://www.npmjs.com/package/gulp-imgresize)
	- no documentation
	- is not being maintained
	- has no tests


## Installing

```shell
npm install gulp-scale-images --save-dev
```


## Usage

```js
const gulp = require('gulp')
const scaleImages = require('gulp-scale-images')

gulp.task('default', () => {
	return gulp.src('src/*.{jpeg,jpg,png,gif}')
	.pipe(scaleImages([
		{
			maxWidth: 500,
			maxHeight: 700,
			format: 'png'
		},
		{
			maxWidth: 1000,
			maxHeight: 1000,
			format: 'jpeg',
			allowEnlargement: true
		}
	]))
	.pipe(gulp.dest('dist'))
})
```

### `gulp-scale-images` works well with

- [`replace-ext`](https://www.npmjs.com/package/replace-ext) – Replaces a file extension with another one.


## Contributing

If you have a question or have difficulties using `gulp-scale-images`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/gulp-scale-images/issues).
