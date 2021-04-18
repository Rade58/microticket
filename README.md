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
