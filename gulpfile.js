var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var compass     = require('gulp-compass');
var fs          = require("fs");
var s3          = require("gulp-s3");
var minifycss   = require('gulp-minify-css');
// var awsCredentials = JSON.parse(fs.readFileSync('aws.json'));
var creds       = require('./aws.json');
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});


// Static Server + watching scss/html files
gulp.task('watch', ['sass'], function() {

    // browserSync.init({
    //     proxy: "cp.dev"
    // });

    gulp.watch("sass/**/*.scss", ['sass']);
    // gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch(['index.html', '_layouts/*.html', '_posts/*', '_projects/*', 'contact/*', 'about.html', 'about/*', 'img/*', '_includes/*'], ['jekyll-rebuild']);
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
        .pipe(minifycss())
        .pipe(gulp.dest("_site/stylesheets"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['browser-sync', 'watch']);

gulp.task('upload', function() {
  return gulp.src('_site/**')
      .pipe(s3(creds, {
        uploadPath: "/",
        headers: {
          'x-amz-acl': 'public-read'
        }
      }));
});