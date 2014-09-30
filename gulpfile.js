'use strict';

var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')(),
    del         = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    pagespeed   = require('psi'),
    reload      = browserSync.reload,
    _           = require('lodash'),
    karma       = require('karma').server,
    variables;


try {
  variables = require('./server/config/_local.env');
} catch(e) {
  variables = {};
}

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];


gulp.task('test:all', ['test', 'all'], function() {
  $.run('karma start karma.conf.js').exec()
    .pipe($.run('mocha server/**/*.spec.js'));
});

gulp.task('mocha', ['test', 'all'], function() {
  $.run('mocha server/**/*.spec.js').exec();
});

gulp.task('karma', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('prod', function() {
  process.env.NODE_ENV = 'production';
});

gulp.task('test', function() {
  process.env.NODE_ENV = 'test';
});

gulp.task('dev', function() {
  process.env.NODE_ENV = 'development';
});

gulp.task('all', function() {
   _.forEach(variables, function(val, variable) {
    process.env[variable] = val;
  });
});


gulp.task('api', ['all', 'dev'], function() {
  $.nodemon({ script: 'server/app.js' , ext: 'js', ignore: ['.tmp/**/*.**', 'app/**/*.**', 'node_modules/**/*.**']});
});

gulp.task('api:prod', ['all', 'prod', 'default'], function() {
  $.nodemon({ script: 'server/app.js' , ext: 'js', ignore: ['.tmp/**/*.**', 'app/**/*.**', 'node_modules/**/*.**']});
});
// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(['app/scripts/**/*.js', 'app/scripts/**/*Test.js'])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  return gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  // return gulp.src([
  //     'app/styles/*.scss',
  //     'app/styles/**/*.css',
  //     'app/styles/app/app.styl',
  //     'app/styles/components/components.scss'
  //   ])
  //   .pipe($.changed('.tmp/styles', {extension: '.css'}))
  //   .pipe($.if('*.scss', $.rubySass({
  //     style: 'expanded',
  //     precision: 10
  //   })
  //   .on('error', console.error.bind(console))
  //   ))
  //   .pipe($.if('*.styl', $.stylus()))
  //   .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
  //   .pipe(gulp.dest('.tmp/styles'))
  //   .pipe($.if('*.css', $.csso()))
  //   .pipe(gulp.dest('dist/styles'))
  //   .pipe($.size({title: 'styles'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        'app/index.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/
      ]
    })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    // .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update Production Style Guide Paths
    .pipe($.replace('components/components.css', 'components/main.min.css'))
    // .pipe($.replace('app/app.css', 'app/app.min.css'))
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml({ empty: true, spare: true })))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'api'], function () {
  browserSync({
    notify: true,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    // server: {
      // baseDir: ['.tmp', 'app']
      proxy: 'localhost:4000'
    // }
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css,styl}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['api:prod'], function () {
  browserSync({
    notify: true,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    // server: {
      // baseDir: 'dist'
      proxy: 'localhost:8080'
    // }

  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['jshint', 'html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  // url: 'http://warm-lake-9782.herokuapp.com',
  // strategy: 'mobile'
}));

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}








