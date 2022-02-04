import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

console.log('fire');

build({
  entryPoints: ['./src/content.ts'],
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  outfile: './dist/dev.js',
  bundle: true,
  watch: true,
  external: ['react', 'react-dom'],
  plugins: [sassPlugin()],
  loader: {
    '.png': 'dataurl',
  },
})
  .then(console.log, console.error)
  .catch(e => console.error(e.message));

// esbuild src/content.ts --outfile=dist/dev.js --bundle --watch --loader:.png=dataurl --loader:.scss=css
