import commonjs from '@rollup/plugin-commonjs';

export default {
	input: "lib/index.js",
	output: {
		name: "ROT",
		format: "umd",
		file: "dist/rot.js",
		exports: 'named'
	},
}
