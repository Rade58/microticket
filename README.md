# RESTARTING THE DEPLOYMENT

U PROSLOB BRANCH-U, USPESNO SMO DEFINISALI BUILDING IMAGE-A I NJEGOV PUSHING TO DOCKER HUB; A SVE SMO TO DEFINISALI, KROZ WORKFLOW FILE, ODNOSNO GITHUB ACTION; ACTION KOJI SE IZVRSAVA ON `push` TO `main`; A ZA push TO `main`, SE ISTO RACUNA I **MERGING PULL REQUEST INTO** `main`

A SADA SE MORAMO POSTARATI DA KROZ ISTI FILE, DEFINISEMO I REACHING INTO RUNNING KUBENETES CLUSTER, KOJI IMAMO NA DIGITAL OCEAN-U; **I DA KAZEMO DEPLOYMENT-U, KOJI JE INSIDE THERE, I KOJI JE RESPONSIBILE FOR OUR POD FOR THE `auth` MICROSERVICE, DA KORISTI NOVI IMAGE**

DA BISMO TO URADILI PROCICEMO KROZ SLICAN PROCES KOJI SMO RANIJE DEFINISALI NA NASOJ LOKALNOJ MACHINE-I, KORISTECI `doctl` CLI

DAKLE POSMATRAMO WORKFLOW KOJI CE BITI RUNNED U GITHUB CONTAINER-U

**MI CEMO DEFINISATI DA SE U GITHUB CONTAINERU INSTALIRA `doctl`**

**NAKON INSTALIRANJA doctl MORAMO SE AUTHORIZE-OVATI, ODNONO MORAMO INICIALIZE-OVATI doctl, KORISCENJEM ONOG API KEY-A SA DIGITAL OCEAN-A (MOZEMO GENERISATI NOVI, ILI KORISTITI ONAJ KOJI SMO VEC NAPRAVILI)**

**ONDA CEMO KORISTITI `doctl` DA FETCH-UJEMO CONTEXT, KOJI DESCRIBE-UJE, KAKO SE KONEKTOVATI DO CLUSTER-A, KOJI RUNN-UJE INSIDE DIGITAL OCEAN**

**TAJ CONTEXT CEMO ONDA FEED-OVATI INTO `kubectl`, KOJI DOLAZI PREINSTALED INSIDE GITHUB CONTAINER**

DA SE BACIMO NA POSAO

OPET NA GITHUB-U OTVARAMO, ONAJ FILE: `/.github/workflows/deploy-auth.yml`

KAKO BISMO DODALI JOS STEP-OVA INSIDE

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
      - run: cd auth && docker build -t radebajic/mt-auth .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-auth
      # REKAO SAM DA MORAMO doctl DA INSTALIRAMO MANUELNO
      # TO JE USTVARI OVO, NISMO BAS MANULNI, JER JE DIGITAL OCEAN
      # NAPRAVIO SHORTCUT, KAKO BI SE doctl INSTALIRAO AUTOMATSKI INSIDE
      # RUNNING GITHUB CONTAINER
      - uses: digitalocean/action-doctl@v2
        # OVO SLEDECE CE OMOGUCITI DA TOKEN KOJI SMO UNELI BUDE PROVIDED
        # TO THE SCRIPT, CIME CEMO DOBITI PREINITIALIZED VERSION OF doctl
        with:
        # ALI PRVO MORAMO GENERISATI TOKEN I DODATI GA KAO SECRET U GITHUB REPO
          token: 
```

**IDEMO SADA U DIGITALOCEAN DASBOARD DA GENERISEMO NOVI TOKEN**

IDEMO U `ACOUNT` -> `API` -> (Personal access tokens) -> `Generate New Token`

TOKENU SAM DAO IME `github_access_token` KAKO BI BILO MORE DESCRIPTIVE

ZATIM SAM KOPIRAO TAJ TOKEN

**IDEMO SADA U GITHUB REPO, DA PODESIMO SECRET**

IDEMO U `Settings` TAB -> `Secrets` -> `New repository secret`

I DODAO SAM SECRET `DIGITALOCEAN_ACCESS_TOKEN`

SADA SE VRACAM NZAD U `/.github/workflows/deploy-auth.yml`, KAKO BI PODESIO KORISCENJE SECRETA, ZA SPECIFICIRANJE TOKEN-A, PRILIKOM AUTHORIZATIONA doctl INSTANNCE U GITHUB CONTAINER-U

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
      - run: cd auth && docker build -t radebajic/mt-auth .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-auth
      - uses: digitalocean/action-doctl@v2
        with:
          # EVO KAKO PODESAVAM TAJ TOKEN
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
```

# SADA CEMO DA DEFINISEMO USING `doctl`, U CILJU GETTING-A KUBERNETES CONFIG-A, I NJEGOVOG SAVINGA U VIRTUAL MACHINE GITHUB CONTAINER-A

MEDJUTIM OBTAIN-UJ IME CLUSTERA, AKO SI GA ZABORAVIO; MOZES GA NACI NARAVNO U DIGITAL OCEAN-U INSIDE `MANAGE` --> `Kubernetes` (IME CLUSTER JE microticket)

`/.github/workflows/deploy-auth.yml`:

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
      - run: cd auth && docker build -t radebajic/mt-auth .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-auth
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      # PISEMO ISTO ONO STO SMO PISALI I NA NASOJ LOKALNOJ MACHINE-I NESTO RANIJE
      # KADA SMO PRVI PUT KORISTILI doctl
      - run: doctl kubernetes cluster kubeconfig save microticket

```

DO CE OMOGUCITI DA U GITHUB CONTAINERU IMAS ALL THE CONTEXT AND PREMISSIONS SHOWED IN kubectl

TAKODJE TO CE UCINITI DA JE ACTIVE CONTEXT ZA kubectl UPRAVO CONTEXT, NASWG CLUSTERA SA DIGITAL OCEAN-A

STO ZANACI DA SE FROM GITHUB CONTAINER MOGU ISSUE-OVATI COMMANDS TO kubectl, I ONE CE BITI EXECUTED AGAINS OUR CLUSTER WHICH IS RUNNING INSIDE DIGITAL OCEAN

# SADA MORAMO DEFINNISATI ISSUING KOMANDE, KAKO BI DEPLOYMENTU BILO RECENO DA SE SAM UPDATE-UJE, I KORISTI LATEST IMAGE, KOJI JE PUSHED TO DOCKER HUB

DAKLE DODAJEMO JOS JEDAN - run SECTION

`/.github/workflows/deploy-auth.yml`:

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
      - run: cd auth && docker build -t radebajic/mt-auth .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker push radebajic/mt-auth
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save microticket
      # PISEMO KOMANDU KOJU SMO DAVNO PISALI, TOKOM UCENJA KUBERNETES-A
      - run: kubectl rollout restart deployment auth-depl

```

COMMIT-UJ FILE

DAKLE, OVIM GORE POSLEDNJIM RUN-OM, DEFINISALI SMO RESTART DEPLOYMENT-A, AND TELL HER TO USE LATEST VERSION OF OUR `radebajic/mt-auth` IMAGE-A

**DAKLE MI SPECIFICALLY JSMO DEFINISALI RESTARTING DEPLOYMENT-A: `infra/k8s/auth-depl.yaml`, I REKLI SMO MU DA KORISTI LATEST IMAGE**

***

digresija:

ALI MISLIM DA CE PROBLEM BITI U TOME STO NAS DEPLOYMENT KORISTI IMAGE SA GOOGLE CLOUD-A A NE SA DOCKER HUB-A

**JER JA SAM U POMENUTOM WORKFLOW FILE-U DEFINISAO CREATING IMAGE-A `radebajic/mt-auth` I NJEGOV PUSHING TO DOCKER HUB**

**A U DEPLOYMRNT FILE-U `infra/k8s/auth-depl.yaml` JE SPECIFICIRAN IMAGE: `eu.gcr.io/microticket/auth`**

ALI VALJDA CU TO POPRAVITI U BUDUCNOSTI

***
