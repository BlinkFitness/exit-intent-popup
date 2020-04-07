// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default {
  entry: 'src/bioEp.js',
  plugins: [ terser() ],

  // bundle options would need to go here too
  sourceMap: true
}
