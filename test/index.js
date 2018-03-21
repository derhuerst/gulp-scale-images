'use strict'

const path = require('path')
const pifyTape = require('tape-promise').default
const tape = require('tape')
const co = require('co')

const createPlugin = require('..')

const src = path.join(__dirname, 'teacup-and-saucer.jpg')

const pTest = pifyTape(tape)

pTest('todo', co.wrap(function* (t) {
	// todo
	t.end()
}))
