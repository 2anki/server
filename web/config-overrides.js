/* config-overrides.js */
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = function override(config) {
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(new MonacoWebpackPlugin());
  if (process.env.NODE_ENV === "production") {
    config.plugins = config.plugins.filter((plugin) => {
      return plugin.constructor.name !== "ForkTsCheckerWebpackPlugin";
    });
    return config;
  }

  let forkTsCheckerWebpackPlugin = config.plugins.find((plugin) => {
    return plugin.constructor.name === "ForkTsCheckerWebpackPlugin";
  });
  forkTsCheckerWebpackPlugin.memoryLimit = 4096;
  return config;
};
// Ref https://github.com/microsoft/monaco-editor/issues/82
// Ref https://www.gitmemory.com/issue/facebook/create-react-app/7135/497102755
