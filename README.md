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
