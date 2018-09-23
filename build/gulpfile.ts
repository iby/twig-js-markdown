import ReadWriteStream = NodeJS.ReadWriteStream;
import {CompileStream, Project} from 'gulp-typescript';
import {TaskCallback} from 'gulp';

import del = require('del');
import gulp = require('gulp');
import json = require('gulp-json-editor');
import merge = require('merge-stream');
import sequence = require('run-sequence');
import tsc = require('gulp-typescript');

/**
 * Clean products.
 */
gulp.task('clean', function (): Promise<string[]> {
    const paths: string[] = [
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
gulp.task('build', function (): ReadWriteStream {
    const project: Project = tsc.createProject('tsconfig.json');
    const configuration = project.config;

    // Must update package details that goes into product for npm deployment.

    const packagePatch: Object = {
        main: 'js/index.js',
        typings: 'ts/index.d.ts'
    };

    // Compile typescript to product, copy any associated files there too.

    const compileStream: CompileStream = <CompileStream>gulp.src(configuration.files.concat(['../source/ts/**/*.ts'])).pipe(project());
    const fileStream: ReadWriteStream = merge(
        gulp.src('../dependency/package.json',).pipe(json(packagePatch)).pipe(gulp.dest('../product')),
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

gulp.task('default', function (callback: TaskCallback): ReadWriteStream {
    return sequence('clean', 'build', callback);
});
