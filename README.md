# APPLYING KUBERNETES MANIFEST ON OUR PRODUCTION CLUSTER ON DIGITAL OCEAN

JASNO JE DA NECEMO KORISTITI `skaffold`

MORACEMO KREIRATI WORKFLOW NA GITHUB-U, ODNOSNO ACTION

IDEM NA `Actions` TAB U GITHUB REPO-U, DA KREIRAM NOVI ACTION, ODNOSNO NOVI WORKFLOW FILE, U KOJEM CU DEFINISATI DA SE U GITHUB CONTAINERU RUNN-UJE `kubctl` KOMANDA KOJA CE APPLY-OVATI SVE POTREBNE K8S MANIFESTS NA NAS CLUSTER NA DIGITAL OCEAN-U

**ALI MORACES DA DEFINISES I ONU PROMENU CONTEXTA ZA kubectl KOJI CE RUNN-OVATI U GITHUB CONTAINERU (A PRE TOGA ISTO DEFINISES I ONAJ AUTHORIZATION, ODNOSNI INITIALIZATION doctl-A)**

U SUSTINI DOBAR DEO CES MOCI PREKOPIRATI IZ FILE-A `/.github/workflows/deploy-auth.yml`

DAKLE OTISLI SMO NA `Actions` TAB U REPO-U, DA BISMO DODALI NOVI WORKFLOW, KOJI CE SE ZVATI: (MADA PROSTO MOZEMO KREIRATI FILE I ODMAH INSIDE `/.github/workflows` FOLDERA)

`/.github/workflows/deploy-manifests.yml`

```yml
name: deploy-manifests

on:
  push:
    branches:
      - main
    paths:
      # OVO CE BITI BITNO, SPECIFICIRAM DVA PATH-A
      - 'infra/k8s/**'
      - 'infra/k8s-prod/**'
# OVO JE SVE U SUSTINI IST KAO STO SAM DEFINISAO U deploy-auth.yml
# OSIM PAR STVARI
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # NE BUILD-UJEMO IMAGE
#       - run: cd auth && docker build -t radebajic/mt-auth .
      
      # NE TRBA NAM NIKAKVA AUTORIZACIJA VEZANA ZA DOCKER HUB, JER KAO STO REKOH
      # OVDE NE BUILD-UJEMO IMAGE, NITI GA SALJEMO DO DOCKER HUB-A
#       - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
#         env:
#           DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
#           DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      # NIKAKV IMAGE NECEMO PUSH-OVATI TO DOCKER HUB
#       - run: docker push radebajic/mt-auth
      # A OVO NAM TEBA DA INICIJLIZUJEMO doctl, TO JE ONAJ TOKEN KOJI SMO GENERISALI
      # NA DIGITAL OCEANU, A PODESILI GA KAO SECRET NA GITHUB REPO-U
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      # OVO JE ONO STO JE U PREDHODNOM WORKFLOW FILE BILO DEFINISANO KAO
      # INICIJALIZACIJA doctl-A, PRI CEMU JE TAKODJE, AUTOMATSKI PROMENJEN CONTEXT
      # ZA kubectl KOJI ONDA MOZE DA KOMANDE IZVRSAVA AGAINST CLUSTER NA DIGITAL OCEAN-U
      - run: doctl kubernetes cluster kubeconfig save microticket
      # OVO JE BILO ONAJ RESTARTING DEPLOYMENTA STO SM ODEFINISALI U PROSLOM WORKFLOW FILE-U
      # NI TO NAM NE TREBA
#       - run: kubectl rollout restart deployment auth-depl
# SADA ONO STO ZELIMO DA DEFINISEMO JE APPLYING, POMENUTIH K8S MANIFESTOVA, NA NAS
# CLUSTER NA DIGITAL OCEAN-U NE ZABORAVI I PRODUCTION FOLDER
      - run: kubectl apply -f infra/k8s && kubectl apply -f infra/k8s-prod
```

MOZEMO DA COMMIT-UJEMO OVAJ FILE NA DUGME `Start commit` -> `Commit new file`

# MI VEC SADA MOZEMO DA KUPIMO DOMAIN NAME, I DA SE VRATIMO NA DEFINISANJE `infra/k8s-prod/ingress-srv.yaml`, KAKO BISMO TAMO SPECIFICIRALI, TAJ DOMAIN NAME, KAO `host`

STO BI ZNACILO A BI MOGLI DA TESTIRAMO NAS CLUSTER, ODNONO TETIRAM ODEPLOYMENT NA TAJ CLUSTER

ALI IMAMO JOS PAR STVARI DA OBAVIMO

A TO SU CECRETS ZA NAS CLUTER, JER TREBA DA POSTOJI NJIH NEKOLIKO; OD ONIH KOJI SE TICU STRIPE-A, ALI I JSON WEB TOKEN SECRET-A

AKO SI ZABORAVIO, NA NJIH, TI SI VEC SPECIFICIRAO KAKO SE ONE UCITAVAJU U PODS NEKIH MICROSERVICA, UPRAVO KROZ K8S MANIFEST FILE-OVE, TAK ODA TO TAMO MOZES DA POGLEDAS
