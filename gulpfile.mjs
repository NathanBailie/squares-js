/* DEPENDENCIES */
import browserSync, { init, notify, stream } from 'browser-sync'; // inject code to all devices
import gulp from 'gulp'; // gulp core
import autoprefixer from 'gulp-autoprefixer'; // sets missing browser prefixes
import clean from 'gulp-clean'; // remove files and folders
import cleanCSS from 'gulp-clean-css'; // minify CSS files
import htmlmin from 'gulp-htmlmin'; // minify HTML files
import gulpif from 'gulp-if'; // conditionally run a task
import imagemin from 'gulp-imagemin'; // minify images
import * as sass from 'sass';
import gulpSass from 'gulp-sass'; // sass compiler
import terser from 'gulp-terser'; // minify JavaScript files
import useref from 'gulp-useref'; // parse build blocks in HTML files
import spritesmith from 'gulp.spritesmith'; // create sprites
import pngquant from 'imagemin-pngquant'; // minify png-format images
import copy from 'gulp-copy'; // simple file copy plugin

const { series, parallel, src, dest, watch } = gulp;
const sassCompiler = gulpSass(sass);

/* BROWSERSYNC (LOCAL SERVER) */
function serve() {
	browserSync.init({
		server: {
			baseDir: './src/',
		}, // base dir
		notify: false, // disable notification
		scrollRestoration: true, // save scroll position
	});
}

/* WATCHER (WATCHING FILE CHANGES)*/
function watcher() {
	watch('./src/**/*.html', html);
	watch('./src/scss/**/*.+(scss|sass|css)', compileSass);
	watch('./src/js/**/*.js', scripts);
	watch('./src/img/sprite/*.*', sprite);
}

/* HTML */
function html() {
	return src('./src/index.html') // get the files
		.pipe(dest('./build/')) // where to put the file
		.pipe(browserSync.stream()); // browsersync stream
}

/* SASS */
function compileSass() {
	return src('./src/scss/**/*') // get the files
		.pipe(sassCompiler().on('error', sassCompiler.logError)) // add prefixes
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 2 versions'],
				cascade: true,
			})
		)
		.pipe(dest('src/css')) // where to put the file
		.pipe(browserSync.stream()); // browsersync stream
}

/* JS */
function scripts() {
	return src('./src/js/**/*.js') // get the files
		.pipe(browserSync.stream()); // browsersync stream
}

/* IMAGES */
function sprite(done) {
	buildSprite().on('end', done);
}

function images() {
	return src('./src/assets/img/**/*') // get the files
		.pipe(
			imagemin({
				// minify images
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
				use: [
					pngquant({
						// minify png-format images
						quality: [0.5, 0.7],
						speed: 4,
					}),
				],
				interlaced: true,
			})
		)
		.pipe(dest('build/assets/img')); // where to put the files
}

/* FAVICON */
function favicon() {
	return src('./src/assets/icons/favicon.ico') // get the favicon
		.pipe(copy('build/assets/icons', { prefix: 4 })); // copy to destination
}

/* DEMO */
function demo() {
	return src('./src/assets/demo/**/*') // get all files in the demo folder
		.pipe(dest('build/assets/demo')); // copy to destination folder
}

/* SCREENSHOTS */
function screenshots() {
	return src('./src/assets/screenshots/**/*') // get all files in the screenshots folder
		.pipe(dest('build/assets/screenshots')); // copy to destination folder
}

/* FONTS */
function fonts() {
	return src('./src/assets/fonts/**/*') // get the files
		.pipe(dest('build/assets/fonts')); // where to put the files
}

/* LIBS (PERSONAL DEVELOPER LIBS) */
function libs() {
	return src('./src/assets/js-libs/**/*') // get the files
		.pipe(dest('build/libs')); // where to put the files
}

/* EXTRAS (ROOT FILES, EXCEPT HTML) */
function extras() {
	return src(['src/*.*', '!src/*.html']) // get the files
		.pipe(dest('build')); // where to put the files
}

/* CLEAN */
function cleanDist() {
	return src('build', { read: false, allowEmpty: true }).pipe(clean()); // clean dir
}

function build() {
	const assets = useref();
	return src('src/*.html')
		.pipe(assets)
		.pipe(gulpif('*.js', terser())) // minify JS
		.pipe(gulpif('*.css', cleanCSS())) // minify CSS
		.pipe(gulpif('*.html', htmlmin({ collapseWhitespace: true }))) // minify HTML
		.pipe(dest('./build')); // where to put the files
}

/* FUNCTIONS */
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

/* TASK EXPORTS */
export const dev = series(
	cleanDist,
	parallel(html, compileSass, scripts),
	parallel(serve, watcher)
);

export const prod = series(
	cleanDist,
	parallel(
		html,
		compileSass,
		scripts,
		images,
		favicon,
		demo,
		screenshots,
		fonts,
		libs,
		extras
	),
	build
);
