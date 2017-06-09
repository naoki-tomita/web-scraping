exports.config = {
  framework: "mocha",
  browserName: "chrome",
  specs: [ "./spec/**/*.js" ],
  plugins: [ { path: "./src/plugin.js" } ]
}