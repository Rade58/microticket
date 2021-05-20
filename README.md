# SPLITTING K8S MANIFEST FILES INTO SEPARATE 3 DIRECTORIES; FOR PRODUCTION, FOR DEVELOPMENT, FOR BOTH DEVELOPMENT AND PRODUCTION

NAIME, MI SMO U PROSLOM BRANCH-U DEFINISALI JEDAN WORKFLOW (`/.github/workflows/deploy-auth.yml`) (KOJI U GITHUB CONTAINER-U TREBA DA OBAVLJA RADNJE OD BUILDINGA DOCKER IMAGE, DO NJEGOVOG PUSHINGA TO DOCKER HUB, PA DO INSTLIRANJA doctl KOMANDE, PA NJENOG KORISCENJA ZA INICIJAZLIZACIJU (PRI KOJOJ SE OBAVLJA I AUTHORIZATION VEZAN ZA DIGITAL OCEAN ,ALI PRVENSTVENO SE DESI PROMENA CONTEXTA ZA kubectl), PA DO RESTARTINGA DEPLOYMENT-A ,KORISCENJEM kubectl KOMANDE); 

MI JESMO SVE TO, POMENUTO DEFINISALI ZA JEDAN DEPLOYMENT,  **ALI ONO STO NISMO DEFINISALI JESTE APLYING K8S MANIFEST FILE-OV NA CLUSTER, STO ZNACI DA NE POSTOJI NI JEDAN DEPLOYMENT U NASEM CLUSTERU NA DIGITAL OCEAN-U**

***

digresija:

DA ZAISTA, SVI ONI FILE-OVI U `infra` FOLDERU, NAZIVAJU SE JOS I K8S MANIFESTS

***

MEDJUTIM PRE BILO KAKVOG APLYING-A MANIFEST FILE-OVA NA CLUSTER, JA TI MORAM RECI KOJE PROBLEME IMAMO

KAO PRVO TI NECES KORSITITI `skaffold`, JER ON JE SLUZIO SAMO ZA DEVELOPMENT

A DVA SU PROBLEMA TU PREVENSTVENO U POGLEDU TOGA, STA PISE U TIM MANIFEST FILE-OVIMA

1. PROBLEM 1

- `cat infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    # OVO JE PROBLEM
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              serviceName: orders-srv
              servicePort: 3000
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              serviceName: payments-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

UNUTAR GORNJEG FILE, KOJI PREDSTAVLJA INGRESS KONFIGURACIJU DEFINISAO SAM DA KADA GOD USER ODE NA HOST `microticket.com`, DA JA ZELIM DA SE APLICIRA SET OF ROUTING RULES, ODNOSNO REDIRECT RULES, KOJE SAM SPECIFICIRAO

**E PA HOST JE PROBLEM JER JE FAKE HOST**, `A M IZELIMO DA DEPLOY-UJEMO NASU APLIKACIJU NA OPEN INTERNET, A ZA TO CE NAM TREBATI DOMAIN NAME, KOJI CEMO KUPITI, I POINT-OVACEMO AT OUR APPLICATION; I NARAVNO TAJ DOMAIN NAME CE BITI RAZLICIT OD ONOG KOJI JE SADA SPECIFICIRAN`

2. PROBLEM 2 (KOJI AUTOR WORKSHOPA NEMA JER JE DEVELOPOVAO NA SVOM RACUNARU, A NE NA GOOGLE CLOUD-U KAO JA)

**SAVAKI OD, MOJIH MANIFEST FILE-OVA**, KOJI REPREZENTUJU DEPLOYMENS I CLUSTER IP KONFIGURACIJE, **USTVARI IMAJU SPECIFICIRAN IMAGE, `ALI NE IIMIGE IZ DOCKER HUB-A`, VEC U FROM REGISTRY ON GOOGLE CLOUD**

EVO VIDI

- `cat infra/k8s/auth-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          # EVO VIDIS, TO JE TAJ IMAGE
          image: eu.gcr.io/microticket/auth
          # I TO NIJE IMAGE radebajic/mt-auth   KOJI SMO
          # SPECIFICIRALI U WORKFLOW FILE-U ZA GITHUB ACTION
          # KOJI NA KRAJU TREBA DA REBUILD-UJE IMAGE
          env:
            - name: MONGO_URI
              value: 'mongodb://auth-mongo-srv:27017/auth'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
spec:
  selector:
    app: auth
  type: ClusterIP
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

# DAKLE I HOST, ALI I IMAGE (U MOM SLUCAJU JE TAKO), DEPENDING DA LI MI RUNN-UJEMO PRODUCTION ILI DEVELOPMENT CLUSTER, TREBA DA BUDU SPECIFICIRANI KAO RAZLICITE VREDNOSTI DEPENDING DA LI JE REC O PRODUCTION IL IDEVELOPMENT CLUSTERU; A MI ZA TAKVU STVAR IMAMO RESENJE

MI K8S MANIFEST FILE-OVE MOZEMO PODELITI U ONE KOJ ISU ZA PRODUCTION, I ONE KOJE SU DEVELOPMENT CLUSTE, ALI I ONE KOJE MOZE DA KORISTI I DEVELOPMENT I PRODUCTION CLUSTER

PRVO CEMO KREIRATI NOVE FOLDERE INSIDE `infra` DIRECTORY

- `mkdir infra/k8s-{prod,dev}`

SADA IMAM UKUPNO TRI FOLDERA:

`infra/k8s` JE ONAJ KOJI VEC HOLD-UJE ONE MANIFEST FILE-OVE KOJE SMO DEFINISALI RANIJE (BAR IH ZA SADA SVE HOLD-UJE)' **I OVAJ DIREKTORIJUM JE DIREKTORIJUM MANIFESTA, KOJI CE BITI APPLYED NA OBA CLUSTER-A, I PROD I DEV**

IMAMO JOS I

`infra/k8s-prod` I `infra/k8s-dev`

**JASNO TI JE ZA KOJE CLUSTERE CE SLUZITI MANIFEST-OVI  POMENUTIH FOLDERA, KOJI SU ZA SADA PRAZNI**

`S OBZIROM KAKVU JA SITUACIJU IMAM, SAMO ONI FILE-OVI KOJI SE TICU DEPLOYMENTA I CLUSTER IP CONFIGOVA, ZA MONGO DATBASE-OVE, ZATIM JEDAN ZA REDIS DATBASE, I JEDAN CONFIG FILE ZA NATS STREAMING SERVER, TREBA DA BUDU INSIDE` **`infra/k8s`**, U KOJEM SE I SADA NALAZE (OSTAVICU TAMO I KONFIGURACIJU ZA `client` MICROSERVICE (BAR CU TO ZA SDA TKO URADITI))

`A SVI OSTALI FILE-OVI, A TU SU KONFIGURACIJE ZA DEPLOYMENTS I CLUSTER IPS SERVICE SVIH MICROSERVICE-OVA, I ZATIM CONFIG FILE ZA INGRESS, NACI CE SE I U` **`infra/k8s-dev`**, `ALI I U` **`infra/k8s-dev`**

**SADA CU DA ISPOMERAM, PA I DA KOPIRAM NEKE FILE-OVE I POKAZACU TI STA IMAM, ODNONO KAKVU IMAM FILE/FOLDER STRUKTURU INSIDE `infra` DIRECTORY**

- `ls infra/k8s`

```zsh
auth-mongo-depl.yaml  expiration-redis-depl.yaml  orders-mongo-depl.yaml    tickets-mongo-depl.yaml
client-depl.yaml      nats-depl.yaml              payments-mongo-depl.yaml
```

- `ls infra/k8s-dev`

```zsh
auth-depl.yaml        ingress-srv.yaml  payments-depl.yaml
expiration-depl.yaml  orders-depl.yaml  tickets-depl.yaml
```

- `ls infra/k8s-prod`

```zsh
auth-depl.yaml        ingress-srv.yaml  payments-depl.yaml
expiration-depl.yaml  orders-depl.yaml  tickets-depl.yaml
```

## SADA CU DA PREPRAVIM, SVE ONE FILE-OVE IZ `infra/k8s-prod`, KOKO BI ONI KORISTILI IMAGE KOJI CE BITI PUSHED TO DOCKER HUB

POKAZACU TI TO NA PRIMERU `infra/k8s-prod/auth-depl.yaml`, A TI PROMENI OSTALE ON YOUR OWN, JER ISTI JE PRINCIP

- `code infra/k8s-prod/auth-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          # UMESTO OVOGA
          # image: eu.gcr.io/microticket/auth
          # DEFINISEM OVO
          image: radebajic/mt-auth
          # JER POMENUTI IMAGE CE BITI NA DOCKER HUB-U
          env:
            - name: MONGO_URI
              value: 'mongodb://auth-mongo-srv:27017/auth'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
spec:
  selector:
    app: auth
  type: ClusterIP
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

## STO SE RICE PROMENE HOST-A INSIDE `infra/k8s-prod/ingress-srv.yaml` TO NE MOZEMO JOS RADITI JER NISMO KUPILI DOMAIN NAME, KOJI BI MOGLI DA SPECIFICIRAMO

ALI CIM KUPIMO DOMAIN NAME ZA NAS APP VRATICU SE DA GA SPECIFICIRAM OVDE: `infra/k8s-prod/ingress-srv.yaml`

# KAKO NAM NAS DEVELOPMENT CLUSTER NA GOOGLE CLOUD-U, MOGAO DOBITI RIGHT CONFIGURATIONS, KADA ODLUCIMO DA DEVELOP-UJEMO, MORAMO MODIFIKOVATI `skaffold.yaml` FILE

DAKLE SAMO DODAJEMO JOS JEDAN PATH, U `manifests` ARRAY

- `code skaffold.yaml`

```yaml
apiVersion: skaffold/v2beta12
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
      # DAKLE DODALI SMO OVO, TAKO DA CE PORED
      # MANIFEST-OVA IZ k8s FOLDERA, UZIMATI I
      # MANIFESTOVE IZ k8s-dev FOLDERA
      - ./infra/k8s-dev/*
build:
  googleCloudBuild:
    projectId: microticket
  artifacts:
    - image: eu.gcr.io/microticket/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: '**/*.{tsx,ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/tickets
      context: tickets
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/orders
      context: orders
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/expiration
      context: expiration
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/payments
      context: payments
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .

```

**A STO SE TICE SPECIFICIRANJA KAKO CE NAS PRODUCTION CLUSTER SA DIGITL OCEAN-A, DOBIJATI MANIFESTS, KOJI CE SE NA NJEGA APPLY-OVATI, O TOME CEMO GOVORITI U SLEDECEM BRANCH-U**

JASNO TI JE DA CEMO DEFINISATI JOS JEDAN WORKFLOW FILE NA GITHUB-U
