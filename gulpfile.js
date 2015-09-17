var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task('default', ['minify-js'], function() {
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
        .pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', ['concat-js'], function(){
   return gulp.src('./dist/library.js')
       .pipe(uglify())
       .pipe(rename({
           extname: '.min.js'
       }))
       .pipe(gulp.dest('./dist/'));
});