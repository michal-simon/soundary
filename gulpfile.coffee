gulp            = require 'gulp'
coffee          = require 'gulp-coffee'
closureCompiler = require 'gulp-closure-compiler'
coffee2closure  = require 'gulp-coffee2closure'
sass            = require 'gulp-sass'
sourcemaps      = require 'gulp-sourcemaps'
livereload      = require 'gulp-livereload'
gutil 		      = require 'gulp-util'
minifyHTML      = require 'gulp-minify-html'
runSequence     = require 'run-sequence'

paths =
  sass: [
    'app/css/**/*.scss'
  ]
  coffee: [
    'app/js/**/*.coffee'
  ]
  html: [
    'app/*.html'
  ]
  js: [
    'bower_components/closure-library/**/*.js'
    'build/js/*.js'
    '!build/js/build.js'
  ]
  compiler: 'bower_components/closure-compiler/compiler.jar'

gulp.task 'sass', ->
    gulp.src paths.sass
        .pipe sourcemaps.init()
        .pipe sass()
        .pipe sourcemaps.write()
        .pipe gulp.dest 'build/css'

gulp.task 'compile', ->
    gulp.src paths.js
        .pipe closureCompiler
            compilerPath: paths.compiler
            fileName: 'build.js',
            compilerFlags:
                closure_entry_point: 'app.main'
                compilation_level: 'ADVANCED_OPTIMIZATIONS'
                define: [
                  "goog.DEBUG=false"
                ]
                only_closure_dependencies: true
                output_wrapper: '(function(){%output%})();'
                warning_level: 'VERBOSE'
        .pipe gulp.dest 'build/js'

gulp.task 'coffee', ->
    gulp.src paths.coffee
        .pipe coffee
            bare: true
        .on 'error', gutil.log
    .pipe coffee2closure()
    .pipe gulp.dest 'build/js'

gulp.task 'minify-html', ->
    gulp.src paths.html
        .pipe minifyHTML 
            omments: true
            spare: true
        .pipe gulp.dest 'build'


gulp.task 'js', (done) ->
    runSequence 'coffee', 'compile', done

gulp.task 'css', (done) ->
    runSequence 'sass', done

gulp.task 'watch', ->
  livereload.listen()
  gulp.watch paths.sass, ['css'] 
  gulp.watch paths.coffee, ['js']
  gulp.watch paths.html, ['minify-html']
  gulp.watch(['build/js/build.js', 'build/css/*.css', 'build/*.html']).on('change', livereload.changed)

gulp.task 'default', (done) ->
    runSequence ['js', 'css', 'minify-html'], 'watch', done