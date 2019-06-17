const { series, src, dest, parallel } = require('gulp')
const del = require('del')
const uglify = require('gulp-uglify')
const terser = require('gulp-terser')
const ejs = require('./plugin/ejs.js')
const rename = require('gulp-rename')
const less = require('gulp-less')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const cryptoRandomString = require('crypto-random-string')
const hash = cryptoRandomString({ length: 10 })
const portalStatic = ''

function clean(cb) {
  del.sync(['dist'])
  cb()
}
function parseHtml() {
  return src('src/pages/*/*.ejs')
    .pipe(ejs({ hash }))
    .pipe(rename({ dirname: '', extname: '.html' }))
    .pipe(dest('dist/'))
}
function parseLess() {
  return src('src/pages/*/*.less')
    .pipe(less())
    .pipe(rename({ dirname: 'css', suffix: '.' + hash }))
    .pipe(dest('dist/' + portalStatic))
}
function parsePublic() {
  return src('public/*').pipe(dest('dist/' + portalStatic))
}
function parseCommonJS() {
  return src('src/common/js/*.js')
    .pipe(concat('js/vendor.js'))
    .pipe(dest('dist/' + portalStatic))
}
function parseCommonCSS() {
  return src('src/common/css/*.less')
    .pipe(less())
    .pipe(concat('css/common.css'))
    .pipe(dest('dist/' + portalStatic))
}
function build() {
  return src('src/pages/*/*.js')
    .pipe(babel())
    .pipe(terser()) // toplevel: true
    .pipe(rename({ dirname: 'js', suffix: '.' + hash }))
    .pipe(dest('dist/' + portalStatic))
}

exports.default = series(
  clean,
  parallel(
    parseHtml,
    parseLess,
    parsePublic,
    parseCommonJS,
    parseCommonCSS,
    build
  )
)
