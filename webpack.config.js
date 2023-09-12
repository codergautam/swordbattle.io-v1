//const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CAPTCHASITE } = require("./config.json");
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
const config = {
  entry: "./src/index.js",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/promo.html", to: "" },
        {
          from: "src/index.html",
          to: "",
          transform(content) {
            return content
              .toString()
              .replace("INSERT_RECAPTCHA_SITE_KEY", CAPTCHASITE)
              .replace("RANDOM_UUID", uuidv4());
          },
        },
        { from: "src/title.html", to: "" },
        { from: "src/about.html", to: "" },
        { from: "src/footer.html", to: "" },
        { from: "src/controls.html", to: "" },
        { from: "src/signup.html", to: "" },
        { from: "src/login.html", to: "" },
        { from: "src/dropdown.html", to: "" },
        { from: "src/sw.js", to: "" },
        { from: "src/manifest.json", to: "" },
        { from: "src/settings.html", to: "" },
        { from: "src/featured.html", to: "" },
        { from: "src/stylesnew1.css", to: "./" },
      ],
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      { test: /\.(js)$/, exclude: /node_modules/, loader: "babel-loader" },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  devtool: "source-map",
  mode: "development",
};

module.exports = config;
