# BUILDING Next.js IMAGE

- `cd client`

- `touch Dockerfile`

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./

RUN npm install --only=prod

COPY ./ ./

CMD ["npm","run", "dev"]

```

**DOCKERIGNORE-UJ I SVE ONO STO SI GITIGNOR-OVAO ZA NEXT**

- `touch .dockerignore`

```dockerfile
node_modules
.next
.env
.vercel
```
