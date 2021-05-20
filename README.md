# PRAVLJENJE OSTALIH WORKFLOW FILE-OVA, KOJI SU NAMENJENI DA SE IMAGE MICROSERVICE-A REBUILD-UJE I PUSH-UJE TO DOCKER HUB; I DA SE DEPLOYMENT MICROSERVICE-A ROLLOUT-UJE WITH NEW IMAGE

DAKLE VEC JEDAN TAKAV FILE SAM KREIRAO, A ON OSIGURAVA DA KADA SE PUSH-UJE TO `main` BRANCH (A U TO SE UBRAJA I MERGING PULL REQUEST TO main BRANCH) A POD USLOVOM DA SAMO TAJ MICROSERVICE IMA I JEDNU PROMENU U SVOM CODEBASE-U, DA SE TADA U VIRTUAL MACHINE-U GITHUB CONTAINER-A USTVARI OBAVI BUILDING NOVOG DOCKER IMAGE-A, PA ZATIM DA SE OBAVI AUTHORIZATION ZA DOCKER HUB, PA DA SE INSTALIRA `doctl`, PA DA SE AUTHORIZUJE doctl, I PROMENI SE CONTEXT ZA ZA `kubectl` (KOJI JE PREINSTALLED U CONTAINERU) (A TAJ CONTEXT SE MENJA SA doctl KOMANDOM KOJA I INICIJALIZUJE TAJ doctl); I NA KRAAJU SE REBUILDROLLOUT-UJE DEPLOYMENT ZA RELATED MICROSERVICE

EVO GA TAKAV JEDINI FILE ZA SADA:

- `cat .github/workflows/deploy-auth.yml`

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
      - run: kubectl rollout restart deployment auth-depl
```

# SADA OVE FILE-OVE NECU DA PRAVIM DIREKTNO NA GITHUBU, VEC CU IH PRAVITI IZ MOG CODEBASE-A, CISTO DA VIDIM DA LI JE I I TO OK NACIN

EVO PRAVIM ONE KOJE MISLIM DA TREBAM (NAPRAVICU I FILE ZA client (MISLIM DA JE LOGICNO DA MI I ZA NJEGA TREBA POMENUTI WORKFLOW))

- `touch .github/workflows/deploy-{tickets,orders,expiration,payments,client}.yml`

**SADA CU DA DEFINISEM, JEDAN OD POMENUTIH FILE-OVA, PA CU DA TI GA PRIKAZEM, A STO SE TICE OSTALIH FILE-OVA, DEFINISACU IH ALI NE MORAM DA IH PRIKAZUJEM, JER CE TI BITI JASNO STA TREBAS DA DEFINISES**

- `code .github/workflows/deploy-orders.yml`

```yml
# EVO DEFINISAO SAM DA IME BUDE deploy-orders
name: deploy-orders

on:
  push:
    branches:
      - main
    paths:
      # OVDE TREBA orders FOLDER
      - 'orders/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # BUILDUJEM ISTI ONAJ IMAGE, KOJI SAM SPECIFICIRAO
      # U  infra/k8s-prod/orders-depl.yaml
      - run: cd auth && docker build -t radebajic/mt-orders .
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      # I OVDE TREBAS DA PUSH-UJES THE RIGHT IMAGE TO DOCKERHUB
      - run: docker push radebajic/mt-orders
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save microticket
      # I OVDE PODESAVAS ROLLOUT orders-depl DEPLOYMENTA
      - run: kubectl rollout restart deployment orders-depl
```

NA ISTI NACIN CU DA DEFINISEM I OSTALE FILE-OVE

`github/workflows/deploy-tickets.yml`

`github/workflows/deploy-expiration.yml`

`github/workflows/deploy-payments.yml`

`github/workflows/deploy-client.yml`

# SADA CU SVE OVE PROMENE DA MERGE-UJEM INTO THE `main` BRANCH

NARAVNO TO VOLIM DA RADIM TAKO STO CU U `dev` BRANCH PRVO LOKALNO SVE PROMENE MERGE-OVATI, PA ZELIM TEK ONDA DA PUSH-UJEM `dev`, PA DA NAPRAVIM PULL REQUEST ZA MERGING dev INTO `main`



