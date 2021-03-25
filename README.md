# `auth` MICROSERVICE SETUP

***
***

ROUTES TO BE CREATED IN NEXT BRANCHES:

`/api/users/signup` (POST); body: `{email: string; password: string}` (CREATING ACCOUNT)

`/api/users/signin` (POST); body: `{email: string; password: string}` (SIGNING IN TO EXISTING ACCOUNT)

`/api/users/signout` (POST); body: `{}` (SIGNING OUT)

`/api/users/currentuser` (GET); body: `none` (RETURNS A SINGLE USER DOCUMENT)

***
***

# FOLDER `auth` (CODE WILL BE IN `src` FOLDER)

- `cd auth`

- `yarn init -y`

DEPENDANCIES SO FAR (IN THE FUTURE IT IS GOING TO BE MANY MANY MORE): `yarn add --dev typescript ts-node-dev @types/express` `yarn add express`

# TYPESCRIPT CONFIG

- `cd auth`

- `npx tsc --init`

# "start" SCRIPT

- `cd auth`

- `code package.json`

```json
"start": "ts-node-dev src/index.ts"
```

# SERVER (NOT YET DONE AS YOU SEE)

`auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

```

# TRYING OUT

- `cd auth`

- `yarn start`
