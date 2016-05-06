// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var strUtil = require('underscore.string');
var mainBowerFiles = require('main-bower-files');
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var mocha = require('gulp-spawn-mocha');
var foreach = require('gulp-foreach');
var rename = require('gulp-rename');
var loopbackAngular = require('gulp-loopback-sdk-angular');
var sourcemaps   = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var inject = require('gulp-inject');
var clean = require('gulp-clean');
var angularSort = require('gulp-angular-filesort');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var wrap = require("gulp-wrap");
var merge = require('ordered-merge-stream');
var loopbackAngular = require('gulp-loopback-sdk-angular');

var SRC = 'client';
var DEST = 'dist';
var TMP = 'tmp';

var lessFiles = SRC + '/modules/**/*.less';

gulp.task('clean', function() {
  return gulp.src([DEST, TMP], {read: false}).pipe(clean());
});

gulp.task('build', [
  'js',
  'lb-angular',
  'gen-app',
  'less',
  'templates',
  'index'
]);

gulp.task('bower', function() {
  return gulp.src(mainBowerFiles()).pipe(gulp.dest(DEST + '/vendor'));
});

gulp.task('templates', function() {
  gulp.src(SRC + '/modules/*/*.template.html')
    .pipe(gulp.dest(DEST + '/modules'));
});

var angularModules = [];

gulp.task('angular-modules', function() {
  return gulp.src(SRC + '/modules/*/**/*.js')
    .pipe(foreach(function(stream, file){
      var moduleData = parseModuleDataFromFile(file);

      angularModules.push(moduleData);

      return stream
        .pipe(wrap(
          {src: SRC + '/modules/module-template.js'},
          moduleData,
          {variable: 'module'}
        ));
    }))
    .pipe(gulp.dest(TMP + '/modules'));
});

function parseInjectAttrs(contents) {
  var re = /@inject\s+([a-zA-Z_$|0-9a-zA-Z_$]+)/gi;
  var match;
  var inject = [];

  while(match = re.exec(contents)) {
    inject.push(match[1]);
  }

  return inject;
}

function parseDepAttrs(contents) {
  var re = /@dep\s+(\S+)/gi;
  var match;
  var deps = [];

  while(match = re.exec(contents)) {
    deps.push(match[1]);
  }

  return deps;
}

function parseModuleDataFromFile(file) {
  var contents = file._contents.toString();
  var inject = parseInjectAttrs(contents);
  var dependencies = parseDepAttrs(contents);

  var dir = path.basename(path.dirname(file.path));
  var filename = path.basename(file.path).replace('.js', '');
  var moduleName = filename.split('.')[0];

  var types = ['controller', 'directive', 'factory', 'service'];
  var type;

  types.forEach(function(t) {
    if(filename.indexOf('.' + t) > -1) {
      type = t;
    }
  });

  var jsName = strUtil.camelize(moduleName);

  return {
    jsName: jsName,
    name: moduleName,
    namespace: dir,
    name: dir + '.' + jsName,
    inject: inject,
    type: type,
    src: contents,
    dependencies: dependencies || []
  };
}

// generate the app module
gulp.task('gen-app', ['angular-modules'], function() {
  var dependencies = [];

  angularModules.forEach(function(mod) {
    if(dependencies.indexOf(mod.name) === -1) {
      dependencies.push(mod.name);
    }
  });

  var appModuleData = {
    jsName: 'app',
    name: 'app',
    type: 'module',
    inject: [],
    src: '',
    dependencies: dependencies
  };

  gulp.src(SRC + '/modules/app.js')
   .pipe(wrap(
      {src: SRC + '/modules/module-template.js'},
      appModuleData,
      {variable: 'module'}
    ))
   .pipe(gulp.dest(DEST + '/modules/app'));
});

gulp.task('js', ['angular-modules'], function() {
  // copy the files
  return gulp.src(TMP + '/modules/*/**/*.js')
    .pipe(gulp.dest(DEST + '/modules'))
    .pipe(livereload());
});

gulp.task('head', function() {
  var src = gulp
    .src('css/**/*.css', {cwd: DEST, base: 'css'});

  var vsrc = gulp
    .src('vendor/*.css', {cwd: DEST, base: 'vendor'});

  return gulp.src(SRC + '/head.html')
    .pipe(inject(merge([src, vsrc])))
    .pipe(gulp.dest(TMP));
});

gulp.task('foot', ['bower'], function() {
  // vendor js files
  var vendor = gulp.src('vendor/*.js', {cwd: DEST, base: 'vendor'})
    .pipe(debug({title: 'vendor'}));

  // js files in angular order
  var js = gulp
    .src('modules/*/**/*.js', {cwd: TMP, base: 'modules'})
    .pipe(angularSort());

  // merge them both
  var src = merge([vendor, js]);

  // inject into the footer
  return gulp.src(SRC + '/foot.html')
    .pipe(inject(src))
    .pipe(gulp.dest(TMP));
});

// gulp.task('index', [
//   'head',
//   'foot'
// ], function() {
//   return gulp.src([TMP + '/head.html', SRC + '/index.html', TMP + '/foot.html'])
//     .pipe(debug({title: 'concat'}))
//     .pipe(concat('index.html'))
//     .pipe(gulp.dest(DEST))
//     .pipe(livereload());
// });

gulp.task('less', function() {
  return gulp.src(lessFiles)
    .pipe(less())
    .pipe(gulp.dest(DEST + '/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen();
  return gulp.watch([lessFiles, SRC + '/**/*.js', SRC + '/**/*.html'], ['build']);
});

gulp.task('serve', [
  'build',
  'watch'
], function(cb) {
  // for demonstration purposes only...
  var express = require('express');
  var app = express();
  app.use(require('./server/server'));
  app.use(express.static(DEST));
  app.listen(3000, cb);
});

gulp.task('modules', function() {
  return gulp
    .src(SRC + '/modules/*/example.html')
    .pipe(wrap(
      {src: SRC + '/example.html'}
    ))
    .pipe(concat('modules.html'))
    .pipe(gulp.dest(TMP))
    .pipe(livereload());
});

gulp.task('index', [
  'head',
  'foot',
  'modules'
], function() {
  return gulp.src([TMP + '/head.html', TMP + '/modules.html', TMP + '/foot.html'])
    .pipe(concat('index.html'))
    .pipe(gulp.dest(DEST))
    .pipe(livereload());
});

// loopback services
gulp.task('lb-angular', function() {
  gulp.src('server/server.js')
    .pipe(loopbackAngular())
    .pipe(rename('lb-services.js'))
    .pipe(gulp.dest(TMP + '/modules/lb-services'));
});
