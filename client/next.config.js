const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  /* PHASE_EXPORT,
  PHASE_PRODUCTION_SERVER, */
} = require("next/constants");

const dotenvLoad = require("dotenv-load");

const nextEnv = require("next-env");
const withPlugins = require("next-compose-plugins");

// const path = require("path");

// ------------------

dotenvLoad();

// ----------------------------------

const envPlugin = nextEnv();

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) console.log("Development");
  if (phase === PHASE_PRODUCTION_BUILD) console.log("Production");

  const newConfig = { ...defaultConfig };

  newConfig.webpack = (config, options) => {
    /* config.module.rules.push({
      test: /\.js$/,
      exclude: /(node_modules)/,
      enforce: "post",
      use: {
        loader: "ify-loader",
      },
    }); */

    return config;
  };

  // WEBPACK 5 ENABLING
  /* newConfig.future = {
    webpack5: true,
  }; */

  // *********************
  // EVO OVDE CU DA PODESIM TU webpackDevMiddleware FUNKCIJU
  newConfig.webpackDevMiddleware = (config) => {
    config.watchOptions.poll = 1000;
    config.watchOptions.aggregateTimeout = 300;
    return config;
  };
  // ***********************

  const configuration = withPlugins([envPlugin])(phase, {
    defaultConfig: newConfig,
  });

  // console.log({ configuration });

  return configuration;
};
