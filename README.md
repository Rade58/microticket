# KREIRANJE K8S KONFIGURACIJA ZA `tickets` MICROSERVICE I NEW MongoDB INSTANCE

DAKLE I OVDE SAM POSEGNUO ZA KOPIRANJEM KUBERNETES CONFIG FILE-OVA RELATED TO `auth` MICROSERVICE 

I TO RADIM U CILJU USTEDE VREMENA

NARAVNO KADA KOPIRAS, ONDA IZVRSIS MODIFIKACIJE U TIM FILE-OVIMA

- `touch infra/k8s/tickets-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets
  template:
    metadata:
      labels:
        app: tickets
    spec:
      containers:
        - name: tickets
          image: eu.gcr.io/microticket/tickets
          env:
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-srv
spec:
  selector:
    app: tickets
  type: ClusterIP
  ports:
    - name: tickets
      protocol: TCP
      port: 3000
      targetPort: 3000

```

**DAKLE GORE SI DEFINISAO CONFIGS ZA DEPLOYMENT I CLUSTER IP ZA `tickets` MICROSERVICE**

- `touch infra/k8s/tickets-mongo-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets-mongo
  template:
    metadata:
      labels:
        app: tickets-mongo
    spec:
      containers:
      - name: tickets-mongo
        image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-mongo-srv
spec:
  selector:
    app: tickets-mongo
  type: ClusterIP
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017

```

**DAKLE GORE SI DEFINISAO CONFIGS ZA DEPLOYMENT I CLUSTER IP ZA MONGODB DB SA KOJIM CE tickets MICROSERVICE RAZGOVARATI** (TO RAZGOVARANJE NARAVNO TEK TREBA DA DEFINISEMO)

## I DPLOYMENT CONFIG ZA `tickets` IMA DEFINED, ONU REFERENCU ZA SECRET OBJECT, KOJI JE ISTO DEO MOG CLUSTERA

DAKLE ONAJ SECRET `JWT_KEY` CE MI TREBATI I ZA TICKETS MICROSERVICE

JER CEMO I U OVOM SERVICE-U KORISTITI VERIFIKACIJU JWT-A

# MORAMO SPECIFICIRATI IMAGE I SYNC SETTINGSE ZA `tickets` MICROSERVICE, U NASEM SKAFFOLD CONFIG FILE-U

- `code skaffold.yaml`

```yaml
apiVersion: skaffold/v2beta12
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
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
    # EVO OVO SAM DODAO OVO
    - image: eu.gcr.io/microticket/tickets
      context: tickets
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
```

## OPET JE NAPOMENA, IAKO SAM JA TO OVDE RADIO, DA SE NE RADI STALNI COPYING I PASTING KONFIGURACIJA I NJIHOVO MENJANJE

OVO SAM JA RADI OSAMO U CILJU USTEDE VREMENA

A MOZE SE DESITI DA DEFINISES NESTO STO, USTVARI NE ZELIS ILI DA NAPRAVIS NEKU GRESKU, I KO ZNA STA JOS

## SADA MOZES DA POKRENES SKAFFOLD

- `skaffold dev`

***

digresija:

**AKO VIDIS NEK ISPECIFICAN ERROR (AKO SKAFFOLD EXIT-UJE, ODNOSNO CRACH-UJE), A IMAS CLUSTER NA SVOJOJ LOKALNOJ MACHINE- I(JA NEMAM NA LOKALNOJ MACHINE-I, VEC NA GOOGLE CLOUD-U); REBUILD-UJE DOCKER IMAGE ZA `tickets` MICROSERVICE I POKRENI OPET SKAFFOLD (U PROSLOM BRANCH-U PONOVO SAM NAVEO KAKO SE TO RADI (BUILDING IMAGE-A), ZATO POGLEDAJ TAMO)**


***

JA SAM USPESNO POKRENUO SKAFFOLD, MOGU PROVERITI, KOJE SERVICE-OVE I DEPLOYMENTE IMAM

- `kubectl get deployments`

```zsh
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
auth-depl            1/1     1            1           5d1h
auth-mongo-depl      1/1     1            1           5d1h
client-depl          1/1     1            1           5d1h
tickets-depl         1/1     1            1           5m7s
tickets-mongo-depl   1/1     1            1           5m6s

```

IZGLEDA DA SVI DEPLOYMENTI RADE (POSLEDNJA DVA SU DAVA NOVA)

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   5d1h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    5d1h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    5d1h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     22d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   5m50s
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    5m51s
```

IZGLEDA DA SVI SERVICE-OVI RADE (POSLEDNJA DVA SU DAVA NOVA CLUSTER IP SERVICE-A)

## POGLEDAJ SKAFFOLD I LOGS ZA `[tickets]` MICROSERVICE

TAMO VIDIM ERROR KOJI JE DATABESE CONNECTION ERROR, JER NISAM U `tickets/src/index.ts` FAJLU OBAVIO TAJ PRVILAN CONNECTION, JER NISAM OBEZBEDIO PRAVI URL TACNIJE, COMMENT-OVAO SAM GA OUT, DA NE BI DOZVOLIO DA SE tickets MICROSERVICE KONEKTUJE SA ONIM DATBASE-OM KOJI IMA Users KOLEKCIJU, JER NE ZELI MDA MOJ tickets MICROSERVICE RAZGOVARA SA TIM DATBASE-OM, VEC SA ITS OWN DATBASE-OM

