# SKAFFOLDING THE `orders` MICROSERVICE

STVARI KOJE CU URADITI DA SETT-UJEM UP orders MICROSERVICE

1. DUPLICATE-UJEM A LOT OF STUFF FROM `tickets` MICROSERVICE

2. INSTALIRAM DEPENDANCIES

3. BUILDING IMAGE-A OD orders MICROSERVICE-A (OPCIONO, SAMO AKO CLUSTER RUNN-UJES LOKALNO N LOCAL MACHINE-I, A MI TO NE RADIMO, VEC NAM JE CLUSTER NA GOOGLE CLOUD-U)

4. KREIRANJE KUBERNATES DEPLOYMENT FILE-A

5. SETTING UP SYNC OPCIJE U SKAFFOLD-U

6. PODESAVANJE ROUTING RULES U INGRESS NGINX KONFIGURACIJI 

# DAKLE KREIRAM `orders` FOLDER I KOPIRACU MNOGE STVARI IZ `tickets` MICROSERVICE-A

- `mkdir -p orders/src/events`

**SADA CU DA KOPIRAM**

EVO STA NAKON KOPIRANJA IMAM U MOM orders MICROSERVICE-U

- `ls -a orders/`

```zsh
Dockerfile  .dockerignore  package.json  src  tsconfig.json  yarn.lock
```

- `ls orders/src`

```zsh
app.ts  events  index.ts
```

- `ls orders/src/events`

```zsh
nats-wrapper.ts
```

SADA U POMENUTIM FILE-OVIMA, GDE GOD SI PISAO `"tickets"` ODREDNICU, PISI `"orders"` (SIGURAN SAM DA JE TO PRVO **`"name"`** FIELD U `package.json`) (**USTVARI TO JE JDINO MESTO U KOJEM TREBAS TO PROMENITI**)

ZA SADA TO JE SVE STA SAM KOPIRAO, A EVENTUALLY MI CEMO KOPIRATI JOS NEKE STVARI

# INSTALIRACEMO SADA DEPENDANCIES

- `cd orders`

- `yarn`

# BUILDING IMAGE-A (`OVO NECU RADITI`)

DAKLE CLUSTER MI JE NA GOOGLE CLOUDU I NE RADIM POMENUTO

ALI U SLUCAJU DA CLUSTER RUNN-UJES LOKALNO TI BI RADIO SLEDECE

`cd orders`

`docker build -t radebajic/orders .`

# SADA KREIRAMO KUBERNATES DEPLOYMENT CONFIG, ALI I CLUSTER IP CONFIG ZA orders MICROSERVICE

- `touch infra/k8s/orders-depl.yaml`

I OVO SMO KOPIRAI IZ tickets-depl, SAMO SMO IZMNILI POTREBNE STVARI

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: orders
  template:
    metadata:
      labels:
        app: orders
    spec:
      containers:
        - name: orders
          image: eu.gcr.io/microticket/orders
          env:
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: microticket
            - name: MONGO_URI
              value: 'mongodb://orders-mongo-srv:27017/orders'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: orders-srv
spec:
  selector:
    app: orders
  type: ClusterIP
  ports:
    - name: orders
      protocol: TCP
      port: 3000
      targetPort: 3000

```
