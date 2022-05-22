
const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const {CAPTCHASITE} = require("./config.json");

const config = {
  entry: "./src/index.js",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/promo.html", to: "" },
        { from: "src/index.html", to: "",  transform(content) {
          return content
            .toString()
            .replace("INSERT_RECAPTCHA_SITE_KEY", CAPTCHASITE)
        }},
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
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  devtool: "source-map",
  mode: "production"
};

module.exports = config;
