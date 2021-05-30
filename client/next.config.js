const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  /* PHASE_EXPORT,
  PHASE_PRODUCTION_SERVER, */
} = require("next/constants");

const dotenvLoad = require("dotenv-load");

const nextEnv = require("next-env");
const withPlugins = require("next-compose-plugins");

// UVOZIMO PLUGIN
const nextOptimizedImagesPlugin = require("next-optimized-images");

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

  // OVDE CEMO ZADATI TAJ PLUGIN, ALI DODAJEMO I OPCIJU target
  const configuration = withPlugins([envPlugin, nextOptimizedImagesPlugin])(
    phase,
    {
      defaultConfig: newConfig,
      target: "serverless",
    }
  );

  // console.log({ configuration });

  return configuration;
};
