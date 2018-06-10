#!/usr/bin/env node
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require("babel-runtime/helpers/extends");

var _extends4 = _interopRequireDefault(_extends3);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("babel-polyfill");
var program = require("commander");

var _require = require("child_process"),
    exec = _require.exec;

var ora = require("ora");
var fs = require("fs");

var deps = {
  "dependencies": ["babel-runtime", "babel-polyfill", "html-webpack-plugin", "prop-types", "react", "react-dom", "react-redux", "react-router", "react-router-dom", "redux", "redux-saga", "webpack", "node-sass", "history"],
  "devDependencies": ["babel-core", "babel-eslint", "babel-jest", "babel-loader", "babel-plugin-transform-async-to-generator", "babel-plugin-transform-class-properties", "babel-plugin-transform-es2015-modules-umd", "babel-plugin-transform-object-rest-spread", "babel-plugin-transform-runtime", "babel-preset-env", "babel-preset-react", "css-loader", "enzyme", "enzyme-adapter-react-16", "eslint-config-mcrowder65", "jest", "react-addons-test-utils", "react-test-renderer", "style-loader", "postcss-loader", "postcss-flexbugs-fixes", "sass-loader", "react-hot-loader", "webpack-dev-server", "identity-obj-proxy", "webpack-bundle-analyzer"]
};

var executeCommand = function executeCommand(command, loadingText) {
  var spinner = void 0;
  return new Promise(function (resolve, reject) {
    try {
      if (loadingText) {
        spinner = ora(loadingText).start();
      }
      exec(command, function (error, stdout) {
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

program.arguments("<folder>").option("-y, --yarn", "Use yarn").option("-f, --force", "rm -rf's your folder for good measure").option("-s, --skip", "Doesn't save to node_modules").action(function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(folder) {
    var fixPackageJson = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var pkgJson, dependencies, devDependencies, newPkg, mapDeps;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                mapDeps = function mapDeps(myDeps) {
                  var mattPkg = require("./package.json");
                  var combined = (0, _extends4.default)({}, mattPkg.devDependencies, mattPkg.dependencies);
                  return myDeps.reduce(function (accum, d) {
                    return (0, _extends4.default)({}, accum, (0, _defineProperty3.default)({}, d, combined[d]));
                  }, {});
                };

                _context.t0 = JSON;
                _context.next = 4;
                return execInFolder("cat package.json");

              case 4:
                _context.t1 = _context.sent;
                pkgJson = _context.t0.parse.call(_context.t0, _context.t1);
                dependencies = deps.dependencies, devDependencies = deps.devDependencies;
                newPkg = (0, _extends4.default)({}, pkgJson, {
                  dependencies: mapDeps(dependencies),
                  devDependencies: mapDeps(devDependencies),
                  eslintConfig: {
                    extends: ["mcrowder65"]
                  },
                  scripts: (0, _extends4.default)({}, pkgJson.scripts, {
                    start: "export NODE_ENV=development && ./node_modules/.bin/webpack-dev-server",
                    test: "npm run linter && npm run jest",
                    jest: "./node_modules/.bin/jest --coverage",
                    linter: "./node_modules/.bin/eslint src --ext .js,.jsx && ./node_modules/.bin/eslint test --ext .js,.jsx",
                    webpack: "export NODE_ENV=production && ./node_modules/.bin/webpack -p --progress",
                    "analyze-bundle": "export ANALYZE_BUNDLE=true && npm run webpack"
                  }),
                  jest: (0, _extends4.default)({}, pkgJson.jest, {
                    setupTestFrameworkScriptFile: "<rootDir>/test/client/config.jsx",
                    moduleNameMapper: {
                      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/file-mock.js",
                      "\\.(css|scss|less)$": "identity-obj-proxy"
                    },
                    coverageReporters: ["html"]
                  })

                });
                _context.next = 10;
                return writeFile(folder + "/package.json", JSON.stringify(newPkg, null, 2));

              case 10:
                if (!program.skip) {
                  _context.next = 14;
                  break;
                }

                displaySuccessMessage("Skipping installation of node_modules");
                _context.next = 16;
                break;

              case 14:
                _context.next = 16;
                return execInFolder("" + install(), "Installing dependencies and devDependencies");

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function fixPackageJson() {
        return _ref2.apply(this, arguments);
      };
    }();

    var scaffold = function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var files, f, file;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                files = ["webpack.config.js", ".babelrc", "src/client/actions/sagas/config.jsx", "src/client/actions/sagas/index.jsx", "src/client/actions/sagas/ping-server.jsx", "src/client/actions/sagas/types.jsx", "src/client/actions/index.jsx", "src/client/actions/types.jsx", "src/client/components/home.jsx", "src/client/reducers/index.jsx", "src/client/reducers/initial-state.jsx", "src/client/styles/base.scss", "src/client/app.jsx", "src/client/browser-history.jsx", "src/client/index.html", "src/client/router.jsx", "test/client/__mocks__/file-mock.js", "test/client/actions/sagas/ping-server.spec.jsx", "test/client/actions/index.spec.jsx", "test/client/components/home.spec.jsx", "test/client/config.jsx"];
                _context2.t0 = _regenerator2.default.keys(files);

              case 2:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 11;
                  break;
                }

                f = _context2.t1.value;
                _context2.next = 6;
                return executeCommand("cat " + f);

              case 6:
                file = _context2.sent;
                _context2.next = 9;
                return writeFile(folder + "/" + f, file);

              case 9:
                _context2.next = 2;
                break;

              case 11:
                displaySuccessMessage("Files scaffolded and placed");

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function scaffold() {
        return _ref3.apply(this, arguments);
      };
    }();

    var execInFolder, pkg, displaySuccessMessage, executeCmdInFolder, enterFolder, install, writeFile;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            writeFile = function writeFile(filename, content) {
              return new Promise(function (resolve, reject) {
                try {
                  var dirs = filename.split("/");
                  if (dirs) {
                    dirs.forEach(function (d, i) {
                      var dir = makeDir(d, i);
                      if (!fs.existsSync(dir) && d.indexOf(".") === -1) {
                        fs.mkdirSync(dir);
                      }
                      function makeDir(currentDirectory, index) {
                        return dirs.filter(function (di, ind) {
                          return ind <= index;
                        }).join("/");
                      }
                    });
                  }
                  fs.writeFile(filename, content, function (error) {
                    if (error) {
                      console.log(error);
                      reject(error);
                    } else {
                      resolve();
                    }
                  });
                } catch (error) {
                  console.log(error);
                  reject(error);
                }
              });
            };

            install = function install() {
              return program.yarn ? "yarn add" : "npm install";
            };

            enterFolder = function enterFolder(str, post) {
              return "cd " + folder + (post ? post : "") + " && " + str;
            };

            executeCmdInFolder = function executeCmdInFolder() {
              return function (str, output) {
                return executeCommand(enterFolder(str), output);
              };
            };

            displaySuccessMessage = function displaySuccessMessage(message) {
              var spinner = ora(message).start();
              spinner.succeed();
            };

            execInFolder = void 0;
            _context3.prev = 6;

            if (!program.force) {
              _context3.next = 10;
              break;
            }

            _context3.next = 10;
            return executeCommand("rm -rf " + folder, "Removing " + folder);

          case 10:
            pkg = program.yarn ? "yarn" : "npm";

            if (program.yarn) {
              displaySuccessMessage("Using yarn to install");
            }
            _context3.next = 14;
            return executeCommand("mkdir " + folder, "Created " + folder);

          case 14:
            execInFolder = executeCmdInFolder();
            _context3.next = 17;
            return execInFolder(pkg + " init " + folder + " -y", pkg + " init " + folder + " -y");

          case 17:
            _context3.next = 19;
            return scaffold();

          case 19:
            _context3.next = 21;
            return fixPackageJson();

          case 21:
            _context3.next = 26;
            break;

          case 23:
            _context3.prev = 23;
            _context3.t0 = _context3["catch"](6);

            if (!_context3.t0.message.indexOf("File exists")) {
              console.error("Something went wrong, sorry");
            } else if (_context3.t0.message.indexOf("File exists") !== -1) {
              console.error("You need to delete " + folder + ", or run again with -f");
            }

          case 26:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[6, 23]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}()).parse(process.argv);
