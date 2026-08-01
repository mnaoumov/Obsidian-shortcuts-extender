import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "main.ts",
  output: {
    file: "main.js",
    format: "cjs",
    sourcemap: "inline",
    exports: "default"
  },
  external: ["obsidian"],
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" })
  ]
};