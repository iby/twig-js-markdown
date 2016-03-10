/// <reference path="../dependency/typings/reference.d.ts"/>

import ReadWriteStream = NodeJS.ReadWriteStream;
import {CompilationStream, TsConfig as Configuration, Project} from 'gulp-typescript';
import {TaskCallback} from 'gulp';

import del = require('del');
import fse = require('fs-extra');
import gulp = require('gulp');
import json = require('gulp-json-editor');
import merge = require('merge-stream');
import path = require('path');
import sequence = require('run-sequence');
import tsc = require('gulp-typescript');

/**
 * Clean products.
 */
gulp.task('clean', function ():ReadWriteStream {
    var paths:[string] = [
        '../product/*.json',
        '../product/*.md',
        '../product/js',
        '../product/ts'
    ];

    return del(paths, {force: true});
});

/**
 * Build products.
 */
gulp.task('build', function ():ReadWriteStream {
    var project:Project = tsc.createProject('tsconfig.json');
    var configuration:Configuration = project.config;

    // Must update package details that goes into product for npm deployment.

    var packagePatch:Object = {
        main: 'js/index.js',
        typings: 'ts/index.d.ts'
    };

    // Compile typescript to product, copy any associated files there too.

    var compileStream:CompilationStream = <CompilationStream>gulp.src(configuration.files.concat(['../source/ts/**/*.ts'])).pipe(tsc(project));
    var fileStream:ReadWriteStream = merge(
        gulp.src('../dependency/package.json').pipe(json(packagePatch)).pipe(gulp.dest('../product')),
        gulp.src('../README.md', {base: '..'}).pipe(gulp.dest('../product')),
        gulp.src('../source/json/**/*', {base: '../source'}).pipe(gulp.dest('../product')));

    // Merge the two output streams, so this task is finished when the IO of both operations are done.

    return merge(
        compileStream.dts.pipe(gulp.dest('../product/ts')),
        compileStream.js.pipe(gulp.dest('../product/js')),
        fileStream);
});

// Todo: rewrite with decent `--watch` cli option.

gulp.task('watch', ['default'], function () {
    gulp.watch('../source/ts/**/*.ts', ['build']);
});

gulp.task('default', function (callback:TaskCallback):ReadWriteStream {
    return sequence('clean', 'build', callback);
});