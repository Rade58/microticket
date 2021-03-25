# `auth` MICROSERVICE SETUP

ROUTES:

`/api/users/signup` (POST); body: `{email: string; password: string}` (CREATING ACCOUNT)

`/api/users/signin` (POST); body: `{email: string; password: string}` (SIGNING IN TO EXISTING ACCOUNT)

`/api/users/signout` (POST); body: `{}` (SIGNING OUT)

`/api/users/currentuser` (GET); body: `none` (RETURNS A SINGLE USER DOCUMENT)

- `mkdir auth`

