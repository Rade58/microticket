# KUBERNATES SETUP FOR `expiration` MICROSERVICE

***

digresija:

**OPET TI NAPOMINJEM DA NE MORAS DA NE MORS DA BUILD-UJES DOCKER IMAGE MANUELNO I SALJES GA TO DOCKER HUB, JER HOSTUJEMO CLUSTER NA GOOGLE CLOUD-U, A GOOGLE IMA SVOJ REGISTRY, KOJI CES SPECIFICIRATI U yaml FILE-U, I TAMO CE TVOJ IMAGE BITI HOSTED AUTOMATSKI NAKON STO POKRENES skaffold**

A INACE DA NISI TO URADIO, DA I DALJE KORISTIS MINIKUBE, TI BI POKRENUO OVO

- `cd expiration`

- `docker build -t radebajic/expiration .`

- `docker push radebajic/expiration`

STO OPET TI NAPOMINJEM MI TO NECEMO POKRETATI

***

# PRVO CU NAPRAVITI DEPLOYMENT CONFIG I CLUSTER IP CONFIG ZA REDIS INSTANCU

PREKOPIRACU BILO KOJU MONGO-VU KONFIGURACIJU, PA CU JE SAMO PREPRAVITI; I NEMOJ DA ZABORAVIS DA DEFINISES THE RIGHT PORT FOR REDIS, A ISTO TAKO I IMAGE

STO SE TICE IMAGE-A KOJI SPECIFICIRAS, TO JE [redis](https://hub.docker.com/_/redis)

A `PORT` ZA CLUSTER IP CONFIG, JESTE `6379`

- `touch infra/k8s/expiration-redis-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-redis-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration-redis
  template:
    metadata:
      labels:
        app: expiration-redis
    spec:
      containers:
      - name: expiration-redis
        image: redis
---
apiVersion: v1
kind: Service
metadata:
  name: expiration-redis-srv
spec:
  selector:
    app: expiration-redis
  type: ClusterIP
  ports:
    - name: db
      protocol: TCP
      port: 6379
      targetPort: 6379

```

# PRAVIM ODEPLOYMENT CONFIG ZA `expiration` MICROSERVICE, ALI NE I CLUSTER IP CONFIG

MOZES DA KOPIRAS, NA PRIMER tickets-OV DEPLOYMENT I SAMO GA PREPRAVIS

ISTO TAKO UKLONICEMO DEFINICIJA ZA ENVIROMENT VARIJABLE, OD MONGO URI I JWT KEY-A, JER NAM TO NE TREBA

**ALI CEMO ZADATI NOVU ENVIROMENT VARIABLE, KOJA CE SE ZVATI `REDIS_HOST`**, A VREDNOST CE MU BITI NAME CLUSTER IP-JA, STO SMO DEFINISALI U GORNJOJ KONFIGURAIJI (TO JE `expiration-redis-srv`)

**STO SE TICE PORT-OVA, WE DON'T CARE ABOUT ANY WHAT SO EVER, JER OVAJ MICROSERVICE NECE BITI KONTAKTIRAN BY ANY OTHER PART OF OUR APPLICATION; DIRECTLY ANYWAYS**

NECEMO IMATI NI NETWORK REQUESTS KOJI BI ISLI DIRECTLYTO THE expiration MICROSERVICE, OT ANYTHING LIKE THAT

TAKO DA NAMA NECE TREBATI KONFIGURACIJA ZA CLUSTER IP SERVICE

- `touch infra/k8s/expiration-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration
  template:
    metadata:
      labels:
        app: expiration
    spec:
      containers:
        - name: expiration
          image: eu.gcr.io/microticket/expiration
          env:
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: microticket
            - name: REDIS_HOST
              value: expiration-redis-srv
```

DAKLE MI SE OVDE SAMO BRINEMO O TOME DA EVENTUALLY BUDE KRIRAN POD ZA expiration MICROSERVICE, KOJI CE KOMUNICIRATI SAMO SA NATS STREAMING SERVEROM

ZATO SAM DEFINISAO SAMO DEPLOYMENT AND NOTHING ELSE

# POKRENUCEMO SADA SKAFFOLD DA VIDIMO KAKO CE SE PONASTI

- `skaffold dev`

PA, U SUSTINI FAIL-OVACE

ALI CES VIDETI DA SU SE IMAGE-OVI KREIRALI

PREDPOSTAVLJAM DA FAIL-UJE JER NISAM DEFINISAO NISTA U SKAFFOLD KONFIGURACIJI

# DODAJEM SADA NOVE STVARI U SKAFFOLD CONFIG

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
    # EVO OVO SAM DODAO
    - image: eu.gcr.io/microticket/expiration
      context: expiration
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
```

SADA MOZES DA POKRENES SKAFFOLD

- `skaffold dev`

IMAS USPESAM BUILD, A A I NOVI MICROSERVICE TI JE STARTOVAO

EVO TI LOGS U SKAFFOLD TERMINALU

```zsh
[expiration] 
[expiration]           Connected to Nats Streaming Server
[expiration]           clientId: expiration-depl-7d88b9dcdc-942ss
[expiration] 
```

MOZEMO DA PROVERIMO I PODS

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS    RESTARTS   AGE
auth-depl-576d774f9b-rfxg9               1/1     Running   0          3m44s
auth-mongo-depl-66687546f4-fh5xg         1/1     Running   0          3m44s
client-depl-554678fc65-ghckt             1/1     Running   0          3m44s
expiration-depl-7d88b9dcdc-942ss         1/1     Running   0          3m43s
expiration-redis-depl-66d7c7554f-qdplg   1/1     Running   0          3m43s
nats-depl-86bc59bbc6-twh68               1/1     Running   0          3m43s
orders-depl-6f48744c44-24m6d             1/1     Running   0          3m42s
orders-mongo-depl-6d8fdfbfb-lx8mc        1/1     Running   0          3m42s
tickets-depl-f6589b5fb-44xt7             1/1     Running   0          3m42s
tickets-mongo-depl-66dc986c98-nkp8r      1/1     Running   0          3m41s
```

EVO GAO STO VIDIS GORE, PODS:

`expiration-depl-7d88b9dcdc-942ss` `expiration-redis-depl-66d7c7554f-qdplg`

ZAISTA RUNN-UJU

## ZA SLUCAJ DA TI NEKI OD POD-OVA FAIL-UJE, MOZES GA DELET-OVATI, PA CE SE ON SAM REBUILD-OVATI

MENI SVE FUNKCIONISE, ALI AKO TI NE FUNKCIONISE, OVAKO MOZES MANUALLY DELET-OVATI POD, CIME CE SE ON UBRZO REBUILD-OVATI


