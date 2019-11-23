import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'dist/fiber.js',
      format: 'cjs',
      esModule: false,
      sourcemap: true
    },
    {
      file: 'dist/fiber.umd.js',
      format: 'umd',
      name: 'Fiber',
      sourcemap: true
    }
  ],
  plugins: [typescript({ lib: ['es6', 'dom'], target: 'es6' })]
};
