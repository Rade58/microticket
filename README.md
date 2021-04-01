# CREATING DATABASE IN KUBERNETES

IMAM ONAJ `api/users/signup` (USING "POST" HTTP METHOD) ENDPOINT (KOJI JE DEO auth MICROSERVICE-A); PA TREBALO BI DA POVEZEM DATABASE, KAOK OHI STORE-OVAO email AND password

KORISTICU `MongoDB`, I KORISTICU Mongoose ODM

SECAS SE DA CE SVAKI OD MICROSERVICE-A IMATI SVOJU SOPSTVENU MongoDB INSTANCU

# INSTALIRAM MONGOOSE

- `cd auth`

- `yarn add mongoose`

# EVENTUALLY NAPRAVICU INSTANCU MONGODB-JA U auth MICROSERVICE-U

STA CES SVE MORATI DA KREIRAS A TICE SE KUBERNETES-A:

- DEPLOYMENT ZA MONGODB
- CLUSTER IP SERVICE ZA TVOJ MONGODB

DAKLE DEPLOYMENT CE NAPRAVITI POD, GDE CE BITI CONTINER SA DATABASE-OM

**A TO CU DAKLE SVE NAPISATI U JEDNOM DEPLOYMENT CONFIG FILE-U**

# KUBERNETES CONFIG

`mongo` IMAGE KOJI CU KORISTITI JESTE IMAGE KOJI JE HOTED NA DOCKER HUB-U ZA PUBLIC USE, I KOJI CU OD TAMO PREUZETI

<https://hub.docker.com/_/mongo>

- `touch infra/k8s/auth-mongo-depl.yaml`

DAKLE JA SAM SPECIFICIRAO `mongo`, KAO IMAGE I TO CE BITI DOVOLJNO DA SE PREUZME BAS ONAJ IMAGE KOJI JE NA GORNJEM LINKU

SA ISTE STRANICE MOZES PROCITITI LKAKO SE KORISTI, POMENUTI IMAGE

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-mongo
  template:
    metadata:
      labels:
        app: auth-mongo
    spec:
      containers:
      - name: auth-mongo
        image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: auth-mongo-srv
spec:
  selector:
    app: auth-mongo
  type: ClusterIP
  ports:
    - name: db
      protocol: TCP
      # OVO JE DEFAULT PORT ZA MONGO, NECU NISTA MODIFIKOVATI
      # DA BI SERVE-OVAO SA DRUGOG PORT-A
      port: 27017
      targetPort: 27017

```

GORE SAM ZA CLUSTER IP ZADO IME `db` (TO JE IME KOJE CE BITI INSIDE LOGS (VIDECU TO U TERMINALIU skaffold-A), ZATO MI TO NIJE SUPER IMPORTAND, NISAM NAERNO STAVIO DUZE IME)
