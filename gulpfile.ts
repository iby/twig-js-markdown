import * as gulp from 'gulp';
import { spawn } from 'child_process';
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

// Compile typescript to product, the build config takes care of the javascript and declaration output paths.
const compile = () => new Promise<void>((resolve, reject) => {
    const tsc = spawn(process.execPath, [require.resolve('typescript/bin/tsc'), '--project', './tsconfig.build.json'], { stdio: 'inherit' });
    tsc.on('error', reject);
    tsc.on('close', code => code === 0 ? resolve() : reject(new Error(`Typescript compiler exited with code ${code}.`)));
});

// Copy any associated files to product, package details must be updated for npm deployment.
const copy = () => {
    const packagePatch: Object = {
        main: 'js/index.js',
        typings: 'ts/index.d.ts'
    };

    return merge(
        gulp.src('./package.json', { base: '.' }).pipe(json(packagePatch)).pipe(gulp.dest('./product')),
        gulp.src('./README.md', { base: '.' }).pipe(gulp.dest('./product'))
    );
};

const build = gulp.parallel(compile, copy);

const watch = () => {
    return gulp.watch('./source/ts/**/*.ts', gulp.series(build));
};

const _build = gulp.series(clean, build);
const _watch = gulp.series(build, watch);

exports.default = _build;
exports.build = _build;
exports.watch = _watch;
