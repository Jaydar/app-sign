import gulp from 'gulp';
import ts from "gulp-typescript";
import uglify from "gulp-uglify";
import paths from "gulp-ts-paths";
import alias from 'gulp-ts-alias';

gulp.task('build',()=>{
    let tsProject = ts.createProject('tsconfig.json');
    // return tsProject.src().pipe(tsProject()).js.pipe(uglify()).pipe(gulp.dest('./dist/Core'))
    return tsProject.src()
    .pipe(alias({ configuration: tsProject.config }))
    .pipe(tsProject())
    .js
    // .pipe(uglify())
    .pipe(gulp.dest('./dist/Core'))
})

gulp.task('copy',()=>{
    return gulp.src([
        './**/*',
        '!./**/*.ts',
        '!./**/*.js',
        '!./node_modules/**',
        '!./Public/**',
        '!./dist/**',
        '!./docker-compose.yml',
        '!./yarn.lock',
        '!./package-lock',
        '!./tsconfig.json',
        '!./docker-super.yml'
    ]).pipe(gulp.dest('./dist'))
})

gulp.task('public',()=>{
    return gulp.src([
        './Public/**/*',
    ]).pipe(gulp.dest('./dist/Public'))
})



gulp.task('default',gulp.series('build','copy'))