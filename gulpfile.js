var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var compass        = require('gulp-compass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        proxy: "cp.dev"
    });

    gulp.watch("sass/**/*.scss", ['sass']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("sass/**/*.scss")
		    .pipe(compass({
		      config_file: './config.rb',
		      css: 'stylesheets',
		      sass: 'sass'
		    }))
        // .pipe(sass())
        .pipe(gulp.dest("stylesheets"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);