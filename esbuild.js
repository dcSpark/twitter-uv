const { build } = require('esbuild');
import { sassPlugin } from 'esbuild-sass-plugin';

build({
  entryPoints: ['./src/content.ts'],
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  outfile: './out.js',
  bundle: true,
  watch: true,
  external: ['react', 'react-dom'],
  plugins: [sassPlugin()],
})
  .then(console.log, console.error)
  .catch(e => console.error(e.message));
