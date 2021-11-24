
const webpack = require("webpack")
const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const config = {
  entry: "./src/index.js",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/promo.html", to: "" },
        { from: "src/index.html", to: "" },
        { from: "src/title.html", to: "" }
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  devtool: "source-map",
  mode: "production",
}

module.exports = config
