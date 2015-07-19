var applicationName = 'twitchdata';

// load modules
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({pattern: '*', scope: ['dependencies', 'devDependencies', 'peerDependencies']});

// paths
var srcBaseDir = 'src/';
var destinationPath = 'dist/';
var jsDistPath = destinationPath + 'js/';
var cssDistPath = destinationPath + 'css/';
var docPath = 'docs/';

// file references
var javaScriptFiles = [srcBaseDir + 'app/**/*.js', '!' + srcBaseDir + 'app/**/*.spec.js'];
var unitTestFiles = srcBaseDir + 'app/**/*.spec.js';
var allJsFiles = [srcBaseDir + 'app/**/*.js'];
var templateFiles = [srcBaseDir + 'app/**/*.html'];
var mainSassFile = srcBaseDir + 'scss/main.scss';
var sassFiles = [srcBaseDir + '/**/*.scss', '!' + srcBaseDir + '/bower_components/'];

var vendorFiles = [
  'src/bower_components/angular/angular.min.js',
  'src/bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'src/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  'src/bower_components/lodash/lodash.min.js',
  'src/bower_components/highstock-release/adapters/standalone-framework.src.js',
  'src/bower_components/highstock-release/highstock.js',
  'src/bower_components/highcharts-ng/dist/highcharts-ng.min.js',
];

// dist files
var jsDistFile = applicationName + '.js';
var vendorDistFile = 'vendor.js';
var templateDistFile = applicationName + '-templates.js';
var combinedJsDistFile = applicationName + '.min.js';
var cssDistFile = 'main.css';
var jsDistFiles = [jsDistPath + vendorDistFile, jsDistPath + jsDistFile, jsDistPath + templateDistFile];

// lint
gulp.task('lint', function () {
    return gulp.src(allJsFiles)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

var t = new Date();
var banner = ['/**',
    ' * Build Time - <%= time %>',
    ' */',
    ''].join('\n');

// concat js files (excluding spec files)
gulp.task('package:js', function () {
    return gulp.src(javaScriptFiles)
        .pipe(plugins.concat(jsDistFile))
        .pipe(plugins.removeUseStrict())
        .pipe(plugins.header(banner, {time: t}))
        .pipe(gulp.dest(jsDistPath));
});

// uglify js files
gulp.task('uglify:js', ['package:js'], function () {
    return gulp.src(jsDistPath + jsDistFile)
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(jsDistPath));
});

// concat and uglify vendor files
gulp.task('package:vendor', function () {
    return gulp.src(vendorFiles)
        .pipe(plugins.concat(vendorDistFile))
        // .pipe(plugins.uglify())
        .pipe(gulp.dest(jsDistPath));
});

// package templates to js file
gulp.task('package:templates', function() {
    return gulp.src(templateFiles)
        .pipe(plugins.html2js({
            outputModuleName: applicationName,
            base: srcBaseDir
        }))
        .pipe(plugins.concat(templateDistFile))
        .pipe(gulp.dest(jsDistPath));
});

gulp.task('uglify:templates', function() {
    return gulp.src(templateFiles)
        .pipe(plugins.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(plugins.html2js({
            outputModuleName: applicationName,
            base: srcBaseDir
        }))
        .pipe(plugins.concat(templateDistFile))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(jsDistPath));
});

// process sass file to css
gulp.task('sass', function () {
    return gulp.src(mainSassFile)
        .pipe(plugins.sass())
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename(cssDistFile))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(cssDistPath));
});

// process sass file to css without minify
gulp.task('sass:dev', function () {
    return gulp.src(mainSassFile)
        .pipe(plugins.sass())
        .pipe(plugins.minifyCss({
            keepSpecialComments: '*',
            keepBreaks: true,
            noAdvanced: true
        }))
        .pipe(plugins.rename(cssDistFile))
        .pipe(gulp.dest(cssDistPath));
});

// copy static files to dist
gulp.task('copy', ['copy:images', 'copy:fonts']);

// copy images to dist
gulp.task('copy:images', function () {
    return gulp.src(srcBaseDir + 'images/**/*.*')
        .pipe(gulp.dest(destinationPath + 'images'));
});

// copy fonts to dist
gulp.task('copy:fonts', function () {
    return gulp.src([srcBaseDir + 'bower_components/bootstrap-sass/assets/fonts/**/*.*', srcBaseDir + 'fonts/**/*.*'])
        .pipe(gulp.dest(destinationPath + 'fonts'));
});

// copy index.html and inject combines js dist file
gulp.task('index', function () {
    return gulp.src(srcBaseDir + 'index.html')
        .pipe(plugins.inject(gulp.src([jsDistPath + combinedJsDistFile, cssDistPath + cssDistFile], {read: false}), {ignorePath: '/dist/', addRootSlash: true}))
        .pipe(gulp.dest(destinationPath));
});

// copy index.html and inject js dist files
gulp.task('index:dev', function () {
    return gulp.src(srcBaseDir + 'index.html')
        .pipe(plugins.inject(gulp.src(jsDistFiles.concat([cssDistPath + cssDistFile]), {read: false}), {ignorePath: '/dist/', addRootSlash: true}))
        .pipe(gulp.dest(destinationPath));
});

// run karma tests
gulp.task('karma', function (done) {
    plugins.karma.server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

// clean destination path
gulp.task('clean', function () {
    return gulp.src(destinationPath)
        .pipe(plugins.clean());
});

// local webserver with livereload
gulp.task('webserver', function() {
    return gulp.src(destinationPath)
        .pipe(plugins.webserver({
            livereload: true,
            open: true,
            proxies: [
            ],
            fallback: 'index.html'
        }));
});

// combines all dist script files to single file
gulp.task('combineDistJsFiles', function () {
    return gulp.src(jsDistFiles)
        .pipe(plugins.clean())
        .pipe(plugins.concat(combinedJsDistFile))
        .pipe(gulp.dest(jsDistPath));
});

/**
 * COMBINED TASKS
 */

// process all scripts
gulp.task('scripts', ['package:vendor', 'uglify:js', 'uglify:templates']);

// process all scripts without uglify (for dev)
gulp.task('scripts:dev', ['package:vendor', 'package:js', 'package:templates']);

// build
gulp.task('build', function(done) {
    plugins.runSequence('clean',  ['copy', 'scripts', 'sass', 'lint'], 'combineDistJsFiles', 'index', done);
});

// build (for dev)
gulp.task('build:dev', function(done) {
    plugins.runSequence('clean',  ['copy', 'scripts:dev', 'sass:dev', 'lint'], 'index:dev', done);
});

// deploy task: run tests, afterwards build
gulp.task('deploy', function(done) {
    plugins.runSequence('karma', 'build', done);
});

// dev workflow: run tests, build for dev, start all watchers, start local webserver
gulp.task('dev', function(done) {
    plugins.runSequence('karma', 'build:dev', 'watch:all', 'webserver', done);
});

// dev workflow without unit tests
gulp.task('dev:notest', function(done) {
    plugins.runSequence('build:dev', 'watch:all:notest', 'webserver', done);
});

/**
 * WATCHERS
 */

// start all watchers
gulp.task('watch:all', ['watch:sass', 'watch:js', 'watch:karma', 'watch:vendor', 'watch:templates', 'watch:index']);

// start all watchers
gulp.task('watch:all:notest', ['watch:sass', 'watch:js:notest', 'watch:vendor', 'watch:templates', 'watch:index']);

// on css changes
gulp.task('watch:sass', function () {
    gulp.watch(sassFiles, ['sass']);
});

// on js changes
gulp.task('watch:js', function () {
    gulp.watch(javaScriptFiles, ['lint', 'package:js', 'karma']);
});

// on js changes, no unit tests
gulp.task('watch:js:notest', function () {
    gulp.watch(javaScriptFiles, ['lint', 'package:js']);
});

// on unit test changes
gulp.task('watch:karma', function () {
    gulp.watch(unitTestFiles, ['karma']);
});

// on vendor changes
gulp.task('watch:vendor', function () {
    gulp.watch(vendorFiles, ['package:vendor']);
});

// on template changes
gulp.task('watch:templates', function () {
    gulp.watch(templateFiles, ['package:templates']);
});

gulp.task('watch:index', function () {
    gulp.watch(srcBaseDir + 'index.html', ['index:dev']);
});
