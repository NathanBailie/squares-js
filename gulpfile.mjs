import browserSync, { init, notify, stream } from 'browser-sync';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import gulpif from 'gulp-if';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import terser from 'gulp-terser';
import useref from 'gulp-useref';
import spritesmith from 'gulp.spritesmith';
import fs from 'fs';
import copy from 'gulp-copy';

const { series, parallel, src, dest, watch } = gulp;
const sassCompiler = gulpSass(sass);

function directoryExists(dirPath) {
	try {
		return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
	} catch (err) {
		return false;
	}
}

function serve() {
	browserSync.init({
		server: {
			baseDir: './src/',
		},
		notify: false,
		scrollRestoration: true,
	});
}

function watcher() {
	watch('./src/**/*.html', html);
	watch('./src/scss/**/*.+(scss|sass|css)', compileSass);
	watch('./src/js/**/*.js', scripts);
	watch('./src/assets/img/sprite/*.*', sprite);
}

function html() {
	return src('./src/index.html', {
		allowEmpty: true,
		buffer: true,
		sourcemaps: true,
	}).pipe(browserSync.stream());
}

function compileSass() {
	return src('./src/scss/**/*.scss', { allowEmpty: true })
		.pipe(
			sassCompiler({ outputStyle: 'expanded' }).on(
				'error',
				sassCompiler.logError
			)
		)
		.pipe(
			gulpif(
				process.env.NODE_ENV === 'production',
				autoprefixer({
					overrideBrowserslist: ['last 2 versions'],
					cascade: true,
				})
			)
		)
		.pipe(dest('src/css'))
		.pipe(browserSync.stream());
}

function scripts() {
	if (process.env.NODE_ENV === 'production') {
		return Promise.resolve();
	}
	return src('./src/js/**/*.js').pipe(browserSync.stream());
}

function sprite(done) {
	if (directoryExists('./src/assets/img/sprite')) {
		buildSprite().on('end', done);
	} else {
		done();
	}
}

function copyImages() {
	if (directoryExists('./src/assets/img')) {
		return src('./src/assets/img/**/*').pipe(copy('./build', { prefix: 1 }));
	}
	return Promise.resolve();
}

function copyFonts() {
	if (directoryExists('./src/assets/fonts')) {
		return src('./src/assets/fonts/**/*').pipe(copy('./build', { prefix: 1 }));
	}
	return Promise.resolve();
}

function copyIcons() {
	if (directoryExists('./src/assets/icons')) {
		return src('./src/assets/icons/**/*').pipe(copy('./build', { prefix: 1 }));
	}
	return Promise.resolve();
}

function copyLibs() {
	if (directoryExists('./src/js/libs')) {
		return src('./src/js/libs/**/*').pipe(copy('./build', { prefix: 1 }));
	}
	return Promise.resolve();
}

function cleanDist() {
	return src('./build', { allowEmpty: true }).pipe(clean());
}

function build() {
	return src('src/*.html')
		.pipe(useref())
		.pipe(gulpif('*.js', terser()))
		.pipe(gulpif('*.css', cleanCSS()))
		.pipe(
			gulpif(
				'*.html',
				htmlmin({
					collapseWhitespace: true,
					removeComments: true,
				})
			)
		)
		.pipe(dest('./build'));
}

function buildSprite() {
	const spriteData = src('./src/assets/img/sprite/*.*').pipe(
		spritesmith({
			imgName: '../img/sprite.png',
			cssName: '_sprite.scss',
			cssFormat: 'scss',
			padding: 5,
		})
	);

	spriteData.img.pipe(dest('./src/assets/img'));
	return spriteData.css.pipe(dest('./src/scss/components'));
}

export const dev = series(
	parallel(html, compileSass),
	parallel(serve, watcher)
);

export const prod = series(
	cleanDist,
	compileSass,
	parallel(scripts, copyImages, copyFonts, copyIcons, copyLibs),
	build
);
