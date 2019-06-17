'use strict'
const through = require('through2')
const PluginError = require('plugin-error')
const ejs = require('ejs')
const path = require('path')

const PLUGIN_NAME = 'gulp-ejs'

function render(data, options = {}) {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file)
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'))
    }

    options.filename = file.path
    const basename = path.basename(file.relative)
    const ejsData = Object.assign({}, data, file.data, {
      chunk: basename.split('.')[0]
    })

    try {
      const rendered = ejs.render(file.contents.toString(), ejsData, options)

      if (options.async && typeof rendered.then === 'function') {
        rendered
          .then(rendered => {
            file.contents = Buffer.from(rendered)
            this.push(file)
          })
          .catch(err => {
            this.emit(
              'error',
              new PluginError(PLUGIN_NAME, err, { fileName: file.path })
            )
          })
          .then(callback)

        return
      }

      file.contents = Buffer.from(rendered)
      this.push(file)
    } catch (err) {
      this.emit(
        'error',
        new PluginError(PLUGIN_NAME, err, { fileName: file.path })
      )
    }

    callback()
  })
}
render.__EJS__ = ejs
module.exports = render
