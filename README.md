# `auth` MICROSERVICE SETUP

ROUTES:

`/api/users/signup` (POST); body: `{email: string; password: string}` (CREATING ACCOUNT)

`/api/users/signin` (POST); body: `{email: string; password: string}` (SIGNING IN TO EXISTING ACCOUNT)

`/api/users/signout` (POST); body: `{}` (SIGNING OUT)

`/api/users/currentuser` (GET); body: `none` (RETURNS A SINGLE USER DOCUMENT)

# FOLDER `auth` (CODE WILL BE IN `src` FOLDER)

- `cd auth`

- `yarn init -y`

DEPENDANCIES SO FAR (IN THE FUTURE IT IS GOING TO BE MANY MANY MORE): `yarn add --dev typescript ts-node-dev @types/express` `yarn add express`

# TYPESCRIPT CONFIG

- `cd auth`

- `npx tsc --init`
