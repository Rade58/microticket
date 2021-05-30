# ADDING `"next-optimized-images-plugin"`

EVO VIDECES KAKO CU GA ZADATI

- `code client/next.config.js`

```js
// OVD SU MNOGE STVARI KOJE SAM DEFINISAO OD RANIJE I
// TO IGNORISI
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const dotenvLoad = require("dotenv-load");

const nextEnv = require("next-env");
const withPlugins = require("next-compose-plugins");

// EVO UVOZIMO PLUGIN, A KORISTIM GA DOLE NA SAMOM KRAJU
const nextOptimizedImagesPlugin = require("next-optimized-images");

dotenvLoad();

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

  newConfig.webpackDevMiddleware = (config) => {
    config.watchOptions.poll = 300;
    config.watchOptions.aggregateTimeout = 300;
    return config;
  };
  

  const configuration = withPlugins([
    envPlugin,
    // OVDE CEMO ZADATI TAJ PLUGIN, ALI DODAJEMO I OPCIJU target
    nextOptimizedImagesPlugin
  ])(
    phase,
    {
      defaultConfig: newConfig,
      // EVO JOS SAM OVO DODAO
      target: "serverless",
    }
  );


  return configuration;
};

```

## I SADA MI VISE NECE DAVATI ERROR, TAMO GDE SAM POKUSAO DA UVEZEM IMAGE

- `cat client/components/premium/header/Header.tsx`

```tsx

```
