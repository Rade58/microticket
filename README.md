# `auth` MICROSERVICE SETUP

ROUTES:

`/api/users/signup` (POST); body: `{email: string; password: string}` (CREATING ACCOUNT)

`/api/users/signin` (POST); body: `{email: string; password: string}` (SIGNING IN TO EXISTING ACCOUNT)

`/api/users/signout` (POST); body: `{}` (SIGNING OUT)

`/api/users/currentuser` (GET); body: `none` (RETURNS A SINGLE USER DOCUMENT)

- `mkdir auth`


***
***

ESLINT, PRETTIER INSTALACIJE (some dev dependancies too)

`yarn add --dev @types/jest @types/node @types/react @types/react-dom @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks prettier typescript`

***
***
