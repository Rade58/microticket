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

# TI IMAS CLUTER DEPLOYED NA GOOGLE CLOUD-U

***

DA TO NEMAS, VEC DA RUNN-UJES SVOJ CLUTER LOCALY (minikube NA LINUC-U) (JA SAM MEDJUTIM TO DISABLE-OVAO, A TAKODJE I DOCKER NA LOKALNOJ MACHINE-I) 

TI BI MANUELNO BUILD-OVAO IMAGE

- `cd client`

- `docker build -t <tvoj dockerhub name>/<image name>`

I TI BI PUSH-OVAO IMAGE TO DOCKER HUB

- `docker push <tvoj dockerhub name>/<image name>`

***

**MEDJUTIM TI TO NE MORAS DA RADIS**
