import * as gulp from 'gulp';
import * as tsc from 'gulp-typescript';
import del from 'del';
import json from 'gulp-json-editor';
import merge from 'merge-stream';

const clean = () => {
    const paths = [
        './product/*.json',
        './product/*.md',
        './product/js',
        './product/ts'
    ];
    return del(paths, { force: true });
};

const build = () => {
    const project = tsc.createProject('./tsconfig.build.json', { rootDir: './source/ts' });

    // Must update package details that goes into product for npm deployment.
    const packagePatch: Object = {
        main: 'js/index.js',
        typings: 'ts/index.d.ts'
    };

    // Compile typescript to product, copy any associated files there too.
    const compileStream = project.src().pipe(project());
    const fileStream = merge(
        gulp.src('./package.json', { base: '.' }).pipe(json(packagePatch)).pipe(gulp.dest('./product')),
        gulp.src('./README.md', { base: '.' }).pipe(gulp.dest('./product')),
        gulp.src('./source/json/**/*', { base: './source' }).pipe(gulp.dest('./product'))
    );

    // Merge the two output streams, so this task is finished when the IO of both operations are done.
    return merge(
        compileStream.dts.pipe(gulp.dest('./product/ts')),
        compileStream.js.pipe(gulp.dest('./product/js')),
        fileStream
    );
};

const watch = () => {
    return gulp.watch('./source/ts/**/*.ts', gulp.series(build));
};

const _build = gulp.series(clean, build);
const _watch = gulp.series(build, watch);

exports.default = _build;
exports.build = _build;
exports.watch = _watch;
