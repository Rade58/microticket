# RUNNING Next.js APP IN KUBERNETES

- `touch infra/k8s/client-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
      - name: client
        image: eu.gcr.io/microticket/client
---
apiVersion: v1
kind: Service
metadata:
  name: client-srv
spec:
  selector:
    app: client
  type: ClusterIP
  ports:
    - name: client
      protocol: TCP
      port: 3000
      targetPort: 3000

```

# SADA PRAVIMO SETTING U SKAFFOLD KONFIGUACIJI ZA NAS NOVI DEPLOYMENT I CLUSTERIP; TAM OSPECIFICIRAMO NAS NOVI IMAGE I SYNCING RULES

```yaml
apiVersion: skaffold/v2beta12
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  googleCloudBuild:
    projectId: microticket
  artifacts:
    - image: eu.gcr.io/microticket/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
        # NISAM SIGURAN DA LI OVDE TREBA DA SE ZADA
        # PATH POPUT auth/src/**/*.{ts,js}
          - src: 'src/**/*.{ts,js}'
            dest: .
    # OVO SAM DAKLE DODAO
    - image: eu.gcr.io/microticket/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          # NISAM SIGURAN DA LI OVDE TREBA DA SE ZADA
          # PATH POPUT client/**/*.{ts,js}
          # ALI AUTOR WORKSHOPA JE OVAKO ZADAO, PA SAM I JA OVO ZADAO
          - src: '**/*.{tsx,ts,js}'
            dest: .
```

# MORAMO DA UPDATE-UJEMO INGRESS NGINX KONFIGURACIJU

- `code infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          # DODAO SAM OVO
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

**DA TI JOS JEDNOM POJASNIM ZASTO MORA `/?(.*)` I ZASTO MORA NA KRAJU**

***

PA ZATO STO JE LEAST SPECIFIC PATH, AKO SE SVI GORNJI PATH-OVI NE MATCH-UJU, MOJ NEXTJS APP CE BITI SERVED NA

`microticket.com/`

ILI 

`microticket.com/<neki path koji nije jedan od onih gore specificiranih>`

***

# SADA U ROOT-U TVOG CELOKUPNOG PROJEKTA, MOZES DA START-UJES SKAFFOLD

***

IMAO SAM DOSTA ERRORA KOJI SU ME NAVELI DA REINSTALIRAM NEKE DEV DEPENDANCIES PA DA IH INSTALIRAM KAO DEPENDANCIES

NALON CEGA JE SVE RADILO

OVO SE DESILO JER SU IMAGE-OVI KOMPLETNO REBUILDED, A ZATO STO JA U DOCKERFILE-U VOLIM DA KORITIM --only=prod KOD NEKIH DEPENDANCIES-A, DA NE BI IZAZVAO KOMPLETAN IMAGE REBUILD

***

- `skaffold dev`

UGLAVNOM NAKON STO SAM INSTALIRAO KAO NORMAL DEPENDANCIES, TYPESCRIPT I JOS NEKE TYPE DEFINISTIONS U SLUCAJU OBA MICROSERVICE-A (I client I auth), SVE JE FUNKCIONISALO KAKO TREBA, NAKON RESTARTING-A SKAFFOLD-A

MOCI CES DA ODES NA

<http://microticket.com/> ILI NA `http://microticket.com/<bilo sta sto nije neki od drugih definisanih rout-ova u ingress-u>`

**NARAVNO, KAA ODES NA <http://microticket.com/> TVOJ NEXTJS PAGE BICE SERVED**

**ALI KADA ODES NA `http://microticket.com/<bilo sta sto nije neki od drugih definisanih rout-ova u ingress-u>`; NEXTJS SERV-UJE SVOJ DEFAULT 404 PAGE**

# NOTE ON FILE CHANGE DETECTION

TI SADA MOZES DA PROMENIS PAGE FILE I SAVE-UJES, I NAKON NEKOLIKO SEKUNDI, BAR U MOM SLUCAJU SKAFFOLD CE TO SYNC-OVATI I TI CES BEZ PAGE REFRESH-A VIDETI PROMENU U BROWSER-U

ALI AUTOR WORKSHOP, KAZE DA JE NEXTJS POMALO **FINICKY**

ON KAZE DA CE SE PONEKADA DESITI DA SE TA PROMENA DOGODI NAKON DUGO VREMENA, A NEKAD SE NECE DOGODITI

MENI SE TO DO SADA NIJE DESILO

EVO PRAVIM PROMENU

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const PageName: FunctionComponent = () => {
  // UMESTO OVOGA
  // return <div>👾</div>;
  // STAVIO OVO
  return <div>Owls are best birds.</div>;
};

export default PageName;

```

PROMENI TREBA NESTO DUZE DA SE APPY-UJE ALI SE DESILA U BROWSERU SAM VIDEO CHANGE

## AUTOR WORKHOPA MEDJUTIM ELI DA NAPRAVI IZMENU U NEXTJS KONFIGURACIJI KAKO BI POPRAVIO TU POSSIBLE NEZELJENOST, PRI KOJOJ FILES NEXTJS NECE DA SE SYNC-UJU

ON USTVARI ZELI DA JA PODESIM `webpackDevMiddleware` OPCIJU U SAMOJ KONFIGURACIJI (TI IGNORISI SVE STO SAM JA U KONFIGURACIJI PODESAVAO, I SAMO GLEDAJ GDE SAM NAPRAVIO TU webpackDevMiddleware FUNKCIJU)

- `code client/next.config.js`

```js
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
  newConfig.future = {
    webpack5: true,
  };

  // *********************
  // EVO OVDE CU DA PODESIM TU webpackDevMiddleware FUNKCIJU
  newConfig.webpackDevMiddleware = (config) => {
    // OVO JE USTVARI STVAR TIMING-A
    // PRE OVOGA, POSTO VALJDA HOT MODULE REPLACEMENT ILI NESTO SLICNO
    // PRATI PROMENE I JA KADA PROMENIM FILE TO NEXTJS WEBPACK 
    // DEO SLUSA I ONDA RADI PROMENE AUTOMATSKI
    // MEDJUTIM DIDAJU CCI OVU OPCIJU JA SAM DEFINISAO DA SVAKIH 300 MILISEKUNDI WEBPACK POGLEDA U FILE DA LI JE PROMENJEN
    // AKO JESTE IZVRSICE TAJ BRZI PULLING PROMENA
    // JER SADA CE RADITI U ZAVISNOSTI OD VREMENA
    config.watchOptions.poll = 300;
    return config;
  };
  // ***********************

  const configuration = withPlugins([envPlugin])(phase, {
    defaultConfig: newConfig,
  });

  // console.log({ configuration });

  return configuration;
};

```

SECAS SE KAKO KADA PROMNIS CONFIGURACIJU NEXT-A DA MORAS DA RESTARTUJES DEV SERVER

ZATO CES MORATI DA RESTARTUJES SKAFFOLD

- `Ctrl + C`

- `skaffold dev`

SACEKAO SAM SA REBUILDINGOM IMAGE-A, PA SAM ONDA NAPRAVIO PROMENU U MOJOJ TRENUTNO JEDINOJ NEXTJS PAGE KOMPONENTI, PROMENA SE DESILA NESTO BRE

UGLAVNOM SVE JE U REDU, MADA NE VIDIM KKO GORNJA OPCIJA UTICE NA SYNCING, KAO POSLEDICU UPOTREBE SKAFFOLD-A (TO NEMA VEZE SA WEBPACKOM)

UGLAVNO MSVE FUNKCIONISE, IAKO JE AUTOR WORKSHOPA EKAO DA MU SE DESAVAJU GRESKE IAKO JE OVO PODESI (MENI SE ZA SADA NE DESAV TA NEZELJENOST PO KOJOJ NEMA PROMENA U PAGE AKO JA PRAVIM CHANGE U CODEBASE-U)
