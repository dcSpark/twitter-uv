const { build } = require("esbuild");

build({
  entryPoints: ["./src/content.ts"],
  define: {
    "process.env.NODE_ENV": '"development"'
  },
  outfile: "./out.js",
  bundle: true,
  watch: true,
  external: ["react", "react-dom"],
}).then(console.log, console.error);
