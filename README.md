# DIFFERENT IMAGES FOR PRODUCTION CLUSTER, AND DIFFERENT IMAGES FOR DEVELOPMENT CLUSTER

OVO CU SADA POKUSATI DA PODESIM NA NACIN DA CU KREIRATI NOVE DOKERFILE-OVE ZA PRODUCTION, A TO ZNACI DA CU KORIGOVATI I WORKFLOW FILE-OVE NA GITHUB-U, KAKO BI TAMO DEFINISAO BUILDING DRUGOG IMAGE-A, ALI UZ POMOC NOVOG DOCKER FILE-A

# ALI PRVO CEMO, ZA JEDAN OD NASIH ExpressJS BASED MICROSERVICE, NAPRAVITI BUILD SCRIPT (ZA TRANSPILING TYPESCRIPT-A U JAVASCRIPT), I STARTUP SCRIPT (U KOJIMA CU DEFINISATI RUNNING EXPRESS APLIKACIJE AGAINST `node` EXECUTABLE)

ALI PRVO CEMO DA DEFINISEMO NOVI DIREKTORIJUM U KOJI CE SE STAVLJATI TRANSPILED JAVASCRIPT

- `code auth/tsconfig.json`

SAMO SAM OVO PODESIO

```json
"outDir": "./build",                              /* Redirect output structure to the directory. */
```

SADA PRAVIM ODREDJENE SCRIPT-OVE (KOJI CE TRANSPILE-OVATI TYPESCRIPT INTO JAVASCRIPT, A I START-UP-OVACE EXPRESS APP), KOJE CU SE RUNN-OVATI, KROZ JEDAN `prod` SCRIPT KOJI CE IMATI NA KARAJU ULOGU I DA RUNN-UJE `build/index.js`

- `code auth/package.json`

OVO SU SCRIPT-OVI KOJE SAM DODAO

```json
"clean": "rm -rf build/",
"build": "npm run clean && tsc",
"prod": "npm run build && node build/index.js"
```

STO ZNACI DA CE BITI DOVOLJNO DA SE SAMO RUNN-UJE `npm run prod`, DA SE APLIKACIJ BUILD-UJE (I TO JE DOVOLJNO DA SE DEFINISE KAO STARTUP SCRIPT U IMAGE-U)

# DEFINISI ZA SVAKI SLUCAJ DA SE GITIGNORE-UJE `build` FOLDER

- `code .gitignore`

```.gitignore
# ...
# ...
auth/build
```

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
CMD ["npm", "prod"]
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
