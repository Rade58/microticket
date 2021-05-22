# DIFFERENT IMAGES FOR PRODUCTION CLUSTER, AND DIFFERENT IMAGES FOR DEVELOPMENT CLUSTER

OVO CU SADA POKUSATI DA PODESIM NA NACIN DA CU KREIRATI NOVE DOKERFILE-OVE ZA PRODUCTION, A TO ZNACI DA CU KORIGOVATI I WORKFLOW FILE-OVE NA GITHUB-U, KAKO BI TAMO DEFINISAO BUILDING DRUGOG IMAGE-A, ALI UZ POMOC NOVOG DOCKER FILE-A

# ALI PRVO CEMO, ZA JEDAN OD NASIH MICROSERVICE, NAPRAVITI BUILD SCRIPT (ZA TRANSPILING TYPESCRIPT-A U JAVASCRIPT), I STARTUP SCRIPT (U KOJIMA CU DEFINISATI RUNNING MICROSERVICE APLIKACIJE AGAINST `node` EXECUTABLE)

**MEDJUTIM IPAK SAM SE ODLUCIO DA, ON MY OWN NE DEFINISEM TAJ TRANSPILING SCRIPT; JER VIDEO SAM DA [LJUDI SLOBODNO KORISTE `ts-node` IN PRODUCTION](https://github.com/TypeStrong/ts-node/issues/104#issuecomment-525358504)**

SAMO SE [TREBA OMOGUCITI: TRANSPILE ONLY, WITHOUT TYPE CHECKING-A, JER SE TADA OMOGUCAVAJU BOLJE RUNTIME PREFORMANCES](https://github.com/TypeStrong/ts-node/issues/104#issuecomment-525358504)

INSTALIRACU [`ts-node`](https://www.npmjs.com/package/ts-node)

SADA CU NAPRAVITI PRODUCTION SCRIPT, ODNONO `prod`

- `code auth/package.json`

OVO SAM DODAO

```json
"prod": "NODE_ENV=production node -r ts-node/register/transpile-only src/index.ts"
```

STO ZNACI DA CE BITI DOVOLJNO DA SE SAMO RUNN-UJE `npm run prod`, DA SE APLIKACIJA BUILD-UJE, I DA SE RUNN-UJE AGAINST node (I TO JE DOVOLJNO DA SE DEFINISE KAO STARTUP SCRIPT U IMAGE-U)

A NAMERNO SAM U CODEBASE-U NEGDE DEFINISAO DA SE STAMPA I `process.env.NODE_ENV` (CISTO RADI PROVERE, DA LI CE BITI DEFINED POMENUTA ENV VARIABLE)

# DODACU NOVI DOCKERFILE, U `auth` MICROSERVICE-U, TO CE BITI `Dockerfile.prod`

ON CE BITI ISTI KAO `Dockerfile` SAO STO CE IMATI SPECIFICIRAN DRUGI STARTUP SCRIPT

- `touch auth/Dockerfile.prod`

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./

RUN npm install --only=prod

COPY ./ ./

# EVO KAO STO VIDIS STAVIO SAM prod
CMD ["npm", "run", "prod"]
```

# SADA CU IZMENITI WORKFLOW `.github/workflows/deploy-auth.yml`, KAKO BI ZADAO DA ON BUILD-UJE IMAGE, KORISTECI `Dockerfile.prod`

SAMO DA TI KAZEM DA SE DEFINISANJE BUILDING-A IMAGE, KADA SPECIFICIRAS FILE, RADI **KORISCENJEM I `-f` FLAG, KOJIM SE SPECIFICIRA FILE**:

`docker build -t <docker_hub_id/image_name> -f <docker_file_name> .` (NARAVNO TREBAS SE NAVIGATE-OVATI U FOLSER U KOJEM SE NALAZI DOCKER FILE)

**OVO CEMO URADITI SA GITHUB-A DA NE BI MORALI DA DVA PUTA PRAVIMO PULL REQUEST, JER BI SE TEK PRI DRUGOM MERGINGU RUNN-OVAO TAJ WORKFLOW FILE**

`.github/workflows/deploy-auth.yml`:

```yml
name: deploy-auth

on:
  push:
    branches:
      - main
    paths:
      - 'auth/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # KAO STO VIDIS DEFINISAO SAM BUILDING IMAGE-A
      # SPECIFICIRAJUCI DOCKERFILE KOJI ZELIM 
      - run: cd auth && docker build -t radebajic/mt-auth -f Dockerfile.prod .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-auth
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save microticket
      - run: kubectl rollout restart deployment auth-depl
```

SADA CEMO PULL-OVATI CHANGES SA `main`-A

- `git pull origin main`

PA CEMO SADA COMMIT-OVATI NASE CHANGES I PUSH-OVATI TO `dev` (SMATRAJ DA SMO SADA U dev BRANCH-U ,TAMO SAM SE POMERIO (MADA I INISI MORAO (JER TI MOZES I IZ DRUGOG BRANCH-A DA PUSH-UJES TO dev)))

- `git add -A`

- `git commit -am 'new image from new dockerfile'`

- `git push origin dev`

**SADA NA GITHUBU RADIM OSVE ONOG OD PRAVLJANJA PULL REQUESTA ZA MERGING `dev` INTO `main`; PA DO MERGINGA TO PULL REQUESTA INTO MAIN; PA CEMO POSMATRATI ACTIONS KAKO CE SE IZVRSAVATI WORKFLOW deploy-auth**

WORKFLOW SE IZVRSIO STO SAM POSMATRAO KROZ `Actions` TAB MOG REPO-A

## MOZES SADA PROVERITI PODS TVOG CLUSTER-A

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS    RESTARTS   AGE
auth-depl-9bdc69dc7-2bdkl                1/1     Running   0          13m
auth-mongo-depl-6b6f97556-hlncf          1/1     Running   0          44h
client-depl-84df58c44b-48c57             1/1     Running   0          53m
expiration-depl-799c4ccb6b-7wt6s         1/1     Running   0          53m
expiration-redis-depl-55c656669f-fc6wv   1/1     Running   0          44h
nats-depl-68b7d794b4-hr85z               1/1     Running   0          44h
orders-depl-7bc79cf95d-hf89m             1/1     Running   0          53m
orders-mongo-depl-6b554544d8-ff25q       1/1     Running   0          44h
payments-depl-58d9d8bcb9-58dbs           1/1     Running   0          22h
payments-mongo-depl-76ffcb78fb-52tsb     1/1     Running   0          44h
tickets-depl-db49fcdd9-7t9r5             1/1     Running   0          53m
tickets-mongo-depl-8546d98f5b-zn2kb      1/1     Running   0          44h

```

SVE FUNKCIONISE

DA VIDIM LOGS IZ auth MICROSERVICE POD-A

- `kubectl logs auth-depl-9bdc69dc7-2bdkl`

```
> auth@1.0.0 prod /app
> NODE_ENV=production node -r ts-node/register/transpile-only src/index.ts

{ NODE_ENV: 'production' }
Connected to DB
listening on  http://localhost:3000 INSIDE auth POD
```

PROBAAJ I MANELNO DA TESTIRAS APP; IDI NA NAS APP U BROWSERU: <http://www.microticket.xyz/>

PROBAJ DA KREIRAS USER-A

I TO JE USPESNO, STO ZNACI DA JE SVE U REDU

# SADA SVE STO SMO RADILI DO SADA U OVOJ LEKCIJI, VEZANO `auth` MICROSERVICE, TI MOZES PONOVITI I DEFINISATI, VEZANO ZA DRUGE MICROSERVICES, OSIM ZA `client`, JER CEMO ZA NJEGA NAKNADNO DEFINISATI

DAKLE INSTALIRAMO `ts-node` U OVIM MICROSERVICE-OVIMA: `orders` `tickets` `payments` `expiration`

U SVAKOM OD NJIHOVIH `package.json` FILE-OVA PODESAVAMO SCRIPT `"prod"`:

```json
"prod": "NODE_ENV=production node -r ts-node/register/transpile-only src/index.ts"
```

DODAJEMO `Dockerfile.prod` FILE, USTVARI MOZEMO GA PREKOPIRATI IZ `auth` MICROSERVICE FOLDERA, I PAST-OVATI U POMENUTE MICROSERVICE-OVE

I ON IZGLEDA OVAKO

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./

RUN npm install --only=prod

COPY ./ ./

CMD ["npm", "run", "prod"]
```

ONDA MORAMO IZMENITI KOMNDU, VEZANU ZA BUILDING DOCKER IMAGE-A, U SVAKOM OD OVIH FILE-OVA:

`.github/workflows/deploy-orders.yml`

`.github/workflows/deploy-payments.yml`

`.github/workflows/deploy-tickets.yml`

`.github/workflows/deploy-expiration.yml`

TAKO DA ONA IZGLEDA OVAKO:

`cd <microservice> && docker build -t radebajic/<image-name> -f Dockerfile.prod .`

AKO SAM OVO GORE URADIO DIREKTNO NA GITHUBU U main BRANCH-U MORACES DA PULL-UJES CHANGES

- `git pull origin main`

**SADA MOZEMO DA OBAVIMO ONAJ PROCES COMMITINGA, PUSHING-A I TAKO DALJE**

- `git add -A`

- `git commit -am 'new images and new startup scripts'`

- `git push origin dev`

**SADA PRAVIMO ONAJ CEO PROCES NA GITHUBU OD PRAVLJANJA PULL REQUESTA ZA MERGING dev-A INTO main, DO ACTIAL MERGING-A PULL REQUESTA INTO main**

USPESNO JE SVE IZVRSENO

POVERIO SAM PODS I VIDEO DA SU SVI OK

# SADA CU SE POZABAVITI `client` MICROSERVICE-OM, ODNONO DEFINISANJEM `Dockerfile.prod` ZA TAJ MICROSERVICE, TAKODJE CU IZMENITI NARACNO KOMANDU INSIDE `.github/workflows/deploy-client.yml` ,VEZANU ZA IMAGE BUILDING

OVDE NE MORAM DA INSTALIRAM `ts-node`, JER NEXTJS RADI SAM TRANSPILING

PRVO, NAPRAVICU PROD SCRIPT U `package.json`-U

- `code client/package.json`

NAZVACU GA `prod`

COMPOSE-OVACU OVO OD DVA POSTOJECA `build` I `start`

```json
"scripts": {
  "dev": "next",
  "build": "next build",
  "start": "next start",
  // EVO OVO SAM DODAO
  "prod": "npm run build && npm run start"
}
```

SADA CU NAPRAVITI NOVI DOCKER FILE, I POSTARACU SE DA KAO STARTUP SCRIPT KORISTI, GORNJI, KOJ ISAM DEFINISAO

- `touch client/Dockerfile.prod`

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./

RUN npm install --only=prod

COPY ./ ./

CMD ["npm","run","prod"]
```

IDEMO SADA NA GITHUB DA KORIGUJEMO, KOAMANDU ZA IMAGE BUILDING INSIDE `.github/workflows/deploy-client.yml` FILE

`.github/workflows/deploy-client.yml`

```yml
name: deploy-client

on:
  push:
    branches:
      - main
    paths:
      - 'client/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # EVO DODAO SAM -f Dockerfile.prod
      - run: cd client && docker build -t radebajic/mt-client -f Dockerfile.prod .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-client
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save microticket
      - run: kubectl rollout restart deployment client-depl
```

MORACEMO KOD NAS LOKALNO (U dev BRANCH-U SMO LOKALNO) DA PULL-UJEMO CHANGE KOJI SMO NAPRAVILI U main-U, DEFINISUCI GORNJI FILE

- `git pull origin main`

**SADA PRAVIMO ONAJ CEO PROCES NA GITHUBU OD PRAVLJANJA PULL REQUESTA ZA MERGING dev-A INTO main, DO ACTIAL MERGING-A PULL REQUESTA INTO main**

USPESNO JE SVE IZVRSENO

**OTISAO SAM NA NAS HOST, ODNOSNO U BROWSER WINDOW-U SAM UNEO <http://www.microticket.xyz/> I PRITISNU ENTER**

I ZAISTA JE SERVED NASA PRODUCTION REACT APLIKACIJA, JER SAM, KROZ REACT DEV TOOLS VIDEO DA JE TAKO

***
***
***
***
***
***

# OSTAVLJM TI PODSETNIK

PUBLISHABLE STRIPE KEY SE U client MICROSERVICEU KORISTI KAO ENV VARIANLE (PODESI TO)

baseUrl:
`client/utils/buildApiClient.ts`

TAKODJE SAM PR
IMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***
***
