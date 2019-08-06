/* eslint-disable no-console */

const gulp = require('gulp');
const sass = require('gulp-sass');
const runSequence = require('run-sequence');
const htmlmin = require('gulp-htmlmin');
const webserver = require('gulp-webserver');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const named = require('vinyl-named');
const path = require('path');
const browserSync = require('browser-sync').create();
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

let webpackConfig = {
    output: {
        path: path.join(__dirname, 'www/js'),
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env', 'react'],
                    plugins: [
                        'transform-object-rest-spread',
                        'transform-class-properties',
                    ]
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [],
};

gulp.task('bs', () => {
    browserSync.init(null, {
        https: true,
    });
});

gulp.task('sass', () => {
    return gulp.src('scss/style-*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/css'))
        .pipe(browserSync.stream());
});

gulp.task('cssmin', () => {
    return gulp.src(['www/css/*.css', '!www/css/*.min.css'])
        .pipe(autoprefixer('last 2 version'))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('www/css'))
        .pipe(browserSync.stream());
});

gulp.task('css', () => {
    return runSequence('sass', 'cssmin');
});

gulp.task('transpile', () => {
    let myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat([
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            comments: false
        }),
    ]);

    return gulp.src(['scripts/app-*.js'])
        .pipe(named())
        .pipe(webpackStream(myConfig), webpack)
        .on('error', (err) => {
            console.log(err.toString());
        })
        .pipe(gulp.dest('www/js'));
});

gulp.task('js', () => {
    return runSequence('transpile');
});

gulp.task('htmlmin', () => {
    let stream = gulp.src(['index.html',]);

    return stream
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('www'));
});

gulp.task('html', () => {
    return runSequence('htmlmin');
});

gulp.task('server', () => {
    return gulp.src('www')
        .pipe(webserver({
            livereload: true,
            //open: true,
            directoryListing: 'www',
            fallback: 'error.html',
            //https: true,
        }));
});

gulp.task('watch', (callback) => {
    gulp.watch(['scss/**/*.scss'], {interval: 500}, ['css']);
    gulp.watch(['index.html'], {interval: 500}, ['html']);
    gulp.watch(['scripts/**/*.js'], {interval: 500}, ['js']);

    return runSequence('bs', callback);
});


gulp.task('default', () => {
    return runSequence(['css', 'js', 'html'], ['watch', 'server']);
});

