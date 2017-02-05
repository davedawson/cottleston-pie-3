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
var $ = require('gulp-load-plugins')();
var iconfont    = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var fontName = 'cp-icons';
var runTimestamp = Math.round(Date.now()/1000);
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
    gulp.watch(['index.html', 'js/*.js', '_layouts/*.html', '_posts/*', '_projects/*', 'contact/*', 'about.html', 'about/*', 'img/*', '_includes/*'], ['jekyll-rebuild']);
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

gulp.task('images', function () {
  return gulp.src('img/home/devices/source/*.{jpg,png}')
    .pipe($.responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '*.png': [{
        width: '60%',
        rename: { suffix: '-60%' },
      }, {
        width: '30%',
        rename: { suffix: '-30%' },
      }, {
        // Compress, strip metadata, and rename original image
        // rename: { suffix: '-original' },
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('img/home/devices'));
});

gulp.task('iconfont', function(){
  return gulp.src(['img/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'sass/templates/_icons.scss',
      targetPath: '../sass/modules/_icons.scss',
      fontPath: '/webfonts/'
    }))
    .pipe(iconfont({
      fontName: fontName, // required 
      prependUnicode: true, // recommended option 
      formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available 
      timestamp: runTimestamp, // recommended to get consistent builds when watching files 
    }))
      .on('glyphs', function(glyphs, options) {
        // CSS templating, e.g. 
        console.log(glyphs, options);
      })
    .pipe(gulp.dest('webfonts/'));
});