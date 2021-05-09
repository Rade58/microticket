# INITIAL SETUP FOR `expiration` MICROSERVICE

- `mkdir -p expiration/src/events`

PREKOPIRACU DOSTA FILE-OVA IZ `tickets` MICROSERVICE-A

EVO STA SVE SADA IMAM INSIDE `expiration`, NAKON TOG KOPIRANJA

- `ls -a expiration/`

```zsh
Dockerfile  .dockerignore  package.json  src  tsconfig.json
```

- `ls -a expiration/src`

```zsh
events  index.ts
```

- `ls -a expiration/src/events`

```zsh
__mocks__  nats-wrapper.ts
```

- `ls -a expiration/src/events/__mocks__`

```zsh
nats-wrapper.ts
```

# MORAMO MALO PREPRAVITI CODE `package.json`-A

- `code expiration/package.json`

MENJAM IME I UKLANJEM SVE DEPENDANCIES KOJE SE TICU HANDLING-A NETWORK REQUEST-OVA

DAKLE SVE STO IMA VEZE SA EXPRESS-OM, JWT-OM, COOKIE SESSION, PA CAK I MONGOOSE-OM

UKLONICES I supertest IZ DEV DEPENDANCIES-A, I MONGODB IN MEMORY SERVER

TAKO DA NA KRAJU `expiration/package.json` IZGLEDA OVAKO

```json
{
  "name": "expiration",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "devDependencies": {
    "jest": "^26.6.3",
    "ts-jest": "^26.5.4"
  },
  "dependencies": {
    "@ramicktick/common": "^1.0.18",
    "node-nats-streaming": "^0.3.2",
    "ts-node-dev": "^1.1.6",
    "typescript": "^4.2.4"
  },
  "scripts": {
    "start": "ts-node-dev src/index.ts",
    "test": "jest --watchAll --no-cache"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "./src/test/setup.ts"
    ]
  }
}
```

# SADA CEMO INSTALIRATI DEPENDANCIES, A DODACEMO ONE OR FEW OTHERS

- `cd expiration`

- `yarn`

INSTALIRACEMO [`bull`](https://www.npmjs.com/package/bull) I TO JE **`JOB PROCESSING MANAGER`**, KOJI CEMO DA KORISTIMO

- `yarn add bull`

# SADA CEMO DA UKLONIMO DOSTA STVARI FROM INSIDE `index.ts`

- `code expiration/src/index.ts`

TAKO DA CE NA KRAJU IZGLEDATI OVAKO

```ts
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });
  } catch (err) {
    console.error(err);
  }
};

start();

```
