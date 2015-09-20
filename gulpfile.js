var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var stripDebug = require('gulp-strip-debug');

/**
 * /dist/library.development (just concat)
 * /dist/library.js (concat + clean)
 * /dist/library.min.js (library.js + minify)
 */

gulp.task('default', ['uglify-js'], function() {
    // ...
});

gulp.task('concat-js', function() {
    return gulp
        .src([
            './js/lib/utils.js',
            './js/lib/*.js',
            './js/index.js',
        ])
        .pipe(concat('library.js'))
        .pipe(concat('library.development.js'))
        .pipe(gulp.dest('./dist/'));
});

// console.log
gulp.task('strip-debug', ['concat-js'], function () {
    return gulp.src('./dist/library.js')
        .pipe(stripDebug())
        .pipe(gulp.dest('./dist'));
});

// minify
gulp.task('uglify-js', ['strip-debug'], function(){
   return gulp.src('./dist/library.js')
       .pipe(uglify())
       .pipe(rename({
           extname: '.min.js'
       }))
       .pipe(gulp.dest('./dist/'));
});

