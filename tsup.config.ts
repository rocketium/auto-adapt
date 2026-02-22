import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		clean: true,
		sourcemap: false,
		splitting: false,
		treeshake: true,
		minify: true,
	},
	{
		entry: ['src/index.ts'],
		dts: { only: true },
	},
]);
