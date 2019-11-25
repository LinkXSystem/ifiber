import typescript from 'rollup-plugin-typescript';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/fiber.js',
      format: 'cjs',
      esModule: false,
      sourcemap: true,
    },
    {
      file: 'dist/fiber.umd.js',
      format: 'umd',
      name: 'Fiber',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*', verbose: true }),
    typescript({ lib: ['es6', 'dom'], target: 'es6' }),
    terser(),
  ],
};
