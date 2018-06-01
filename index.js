#!/usr/bin/env node
const program = require("commander");
const { exec } = require("child_process");
const ora = require("ora");

const deps = {
  "dependencies": {
    "html-webpack-plugin": "^2.30.1",
    "prop-types": "^15.6.0",
    "react": "^15.6.2",
    "react-dom": "^15.6.2",
    "react-redux": "^5.0.6",
    "react-router": "^4.2.0",
    "react-router-dom": "^4.2.2",
    "redux": "^3.7.2",
    "redux-saga": "^0.16.0",
    "webpack": "^3.8.1",
    "webpack-dev-server": "^2.9.4"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-eslint": "^8.0.2",
    "babel-jest": "^21.2.0",
    "babel-loader": "^7.1.2",
    "babel-plugin-transform-async-to-generator": "^6.24.1",
    "babel-plugin-transform-es2015-modules-umd": "^6.24.1",
    "babel-plugin-transform-object-rest-spread": "^6.26.0",
    "babel-polyfill": "^6.26.0",
    "babel-preset-env": "^1.7.0",
    "babel-preset-react": "^6.24.1",
    "css-loader": "^0.28.7",
    "enzyme": "^2.9.1",
    "eslint-config-mcrowder65": "latest",
    "jest": "^21.2.1",
    "react-addons-test-utils": "^15.6.2",
    "react-test-renderer": "^16.1.1",
    "style-loader": "^0.18.2"
  }};

const executeCommand = (command, loadingText) => {
  if (!loadingText) {
    // eslint-disable-next-line no-param-reassign
    loadingText = command;
  }
  let spinner;
  return new Promise((resolve, reject) => {
    try {
      if (loadingText) {
        spinner = ora(loadingText).start();
      }
      exec(command, (error, stdout) => {
        if (error) {
          if (error.message.indexOf("File exists") !== -1) {
            spinner.fail(error.message);
            reject(error);
          } else {

            reject(error);
          }
        } else {
          if (loadingText) {
            spinner.succeed();
          }
          resolve(stdout);
        }
      });
    } catch (error) {
      if (loadingText) {
        spinner.fail();
      }
      reject(error);
    }
  });

};

const webpackConfig = `const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: "./src/client/index.html",
  filename: "./index.html",
  inject: "body"
});
module.exports = {
  cache: true,
  devtool: "sourcemap",
  entry: "./src/client/app.jsx",
  output: {
    path: \`${__dirname}/build\`,
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }, {
        test: /\.jsx$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  plugins: [HtmlWebpackPluginConfig]

};`;

program
  .arguments("<folder>")
  .option("-y, --yarn", "Add yarn")
  .option("-f, --force", "rm -rf's your folder for good measure")
  .action(async folder => {
    try {
      if (program.force) {
        await executeCommand(`rm -rf ${folder}`);
      }
      const pkg = program.yarn ? "yarn" : "npm";
      if (program.yarn) {
        const spinner = ora("Using yarn to install").start();
        spinner.succeed();
      }
      await executeCommand(`mkdir ${folder}`, `Created ${folder}`);
      await executeCommand(enterFolder(`${pkg} init ${folder} -y`), `${pkg} init ${folder} -y`);
      const dependencies = Object.entries(deps.dependencies).map(([dep, version]) => `${dep}@${version}`).join(" ");
      // await executeCommand(enterFolder(`${install()} ${dependencies}`), "Installing dependencies");
      const devDependencies = Object.entries(deps.devDependencies).map(([dep, version]) => `${dep}@${version}`).join(" ");
      // await executeCommand(enterFolder(`${install()} -D ${devDependencies}`), "Installing devDependencies");
      await executeCommand(enterFolder(`echo '${webpackConfig}' > webpack.config.js`), "Webpack configured");
      await createFolderStructure();
      await createSagas();
    } catch (error) {
      if (!error.message.indexOf("File exists")) {
        console.error("Something went wrong, sorry");
      } else if (error.message.indexOf("File exists") !== -1) {
        console.error(`You need to delete ${folder}, or run again with -f`);
      }
    }
    async function createSagas() {
      await wrapper(`config.jsx`);
      await wrapper(`index.jsx`);
      await wrapper(`ping-server.jsx`);
      await wrapper(`types.jsx`);
      function wrapper(filename) {
        const filepath = `curl -O https://raw.githubusercontent.com/mcrowder65/create-react-matt/master/`;
        const prepend = `src/client/actions/sagas/`;
        return executeCommand(enterFolder(`${filepath}${prepend}${filename}`, `/${prepend}`));
      }
    }
    async function createFolderStructure() {
      await executeCommand(enterFolder(`mkdir -p src/client/actions/sagas && mkdir -p src/client/components && mkdir -p src/client/reducers && mkdir -p src/client/styles`));
      await executeCommand(enterFolder(`mkdir -p test/client/actions/sagas && mkdir -p test/client/components`));
    }
    function enterFolder(str, post) {
      return `cd ${folder}${post ? post : ""} && ${str}`;
    }

    function install() {
      return program.yarn ? "yarn add" : "npm install";
    }
  })
  .parse(process.argv);