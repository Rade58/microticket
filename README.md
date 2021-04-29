# SKAFFOLDING THE `orders` MICROSERVICE

STVARI KOJE CU URADITI DA SETT-UJEM UP orders MICROSERVICE

1. DUPLICATE-UJEM A LOT OF STUFF FROM `tickets` MICROSERVICE

2. INSTALIRAM DEPENDANCIES

3. BUILDING IMAGE-A OD orders MICROSERVICE-A (OPCIONO, SAMO AKO CLUSTER RUNN-UJES LOKALNO N LOCAL MACHINE-I, A MI TO NE RADIMO, VEC NAM JE CLUSTER NA GOOGLE CLOUD-U)

4. KREIRANJE KUBERNATES DEPLOYMENT FILE-A ZA orders MICROSERVICE

5. KREIRANJE KUBERNATES DEPLOYMENT FILE, ZA NOVU MONGODB INSTANCU, SA KOOM CE PRICATI orders

6. SETTING UP SYNC OPCIJE U SKAFFOLD-U

7. PODESAVANJE ROUTING RULES U INGRESS NGINX KONFIGURACIJI 

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

# KREIRAM KUBERNETES DEPLOYMENT I CLUSTER IP CONFIGS ZA NOVU INSTANCU MONGODB-JA

- `touch infra/k8s/orders-mongo-depl.yaml`

I OVO KOPIRAM FROM tickets-mongo-depl; NARAVNO PRAVIM NEOPHODNE IZMENE

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: orders-mongo
  template:
    metadata:
      labels:
        app: orders-mongo
    spec:
      containers:
      - name: orders-mongo
        image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: orders-mongo-srv
spec:
  selector:
    app: orders-mongo
  type: ClusterIP
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

# PODESAVAMO ST ZALIMO DA SYNC-UJEMO OD FILE-OVA VEZANO ZA SKAFFOLD

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
    # EVO OVO SAM DODAO
    - image: eu.gcr.io/microticket/orders
      context: orders
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
```

VEC SADA MOZES POKRENUTI SKAFFOLD

ALI HAJDE DA PODESIMO I ROUTING RULES ZA INGRESS NGINX

# SADA PODESAVAMO ROUTING RULES U INGRESS NGINX KONFIGURACIJI

- `code infra/k8s/ingress-srv.yaml`

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
          # DODAO SAM OVO I TO NA OVOM MESTU
          # I SAM ZNAS ZASTO NE SME NA ZADNJEM MESTU (NECU DA SE PONAVLJAM 100 PUTA)
          #
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              serviceName: orders-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

# MOZEMO SADA DA RUNN-UJEMO SKAFFOLD

NARAVNO NODE PROCESS U orders MICROSERVICE-U BI TREBALO DA THROW-UJ ERROR, JER IMAMO DOSTA IMPORTA U MICROSERVICE-U ,ZA MODULE KOJI NISU DEFINISANI

**NARAVNO, NE OCEKUJEM NIKAKVE ERRORE OKO BUILDINGA CONTAINERA I OSTALIH KUBERNETES STVARI**

- `skaffold dev`

MOZES ODMAH DA POKRENES `kubectl get pods` I VIDECES DA JE SVE TERMINATED, JER SI POKRENUO SKAFFOLD

ALI AKO SACEKAS DA SKAFFOLD ODRADI SVOJE, MOZEMO NACI POD-OVE, ZA NOVE STVARI KOJE SMO ZELELI U NASEM CLUSTERU

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-696b6948b4-dn658            1/1     Running   0          2m52s
auth-mongo-depl-68fbcc475b-zjg6j      1/1     Running   0          2m52s
client-depl-55bc5b996f-pwqvn          1/1     Running   0          2m52s
nats-depl-cd7f7fb9d-wlfk7             1/1     Running   0          2m51s
orders-depl-69dbc6bf7b-42wc4          1/1     Running   0          2m51s
orders-mongo-depl-6bb8cf964b-tdt8l    1/1     Running   0          2m50s
tickets-depl-ff44f76bf-74jbg          1/1     Running   0          2m49s
tickets-mongo-depl-597c555dd4-4bbwg   1/1     Running   0          2m49s
```

EVO VIDIM OVE PODS: `orders-depl-69dbc6bf7b-42wc4 `, `orders-mongo-depl-6bb8cf964b-tdt8l`

**STO SE TICE SAMIH LOGG-OVA U SKAFFOLD TERMINALU, ZA order MICROSERVICE VIDIMO OVO**

```zsh
[orders] 
[orders] > orders@1.0.0 start /app
[orders] > ts-node-dev src/index.ts
[orders] 
[orders] [INFO] 19:14:27 ts-node-dev ver. 1.1.6 (using ts-node ver. 9.1.1, typescript ver. 4.2.4)
[orders] Compilation error in /app/src/app.ts
[orders] [ERROR] 19:14:36 ⨯ Unable to compile TypeScript:
[orders] src/app.ts(6,36): error TS2307: Cannot find module './routes/new' or its corresponding type declarations.
[orders] src/app.ts(8,40): error TS2307: Cannot find module './routes/show' or its corresponding type declarations.
[orders] src/app.ts(9,37): error TS2307: Cannot find module './routes/' or its corresponding type declarations.
[orders] src/app.ts(11,39): error TS2307: Cannot find module './routes/update' or its corresponding type declarations.
[orders]
```

DAKLE VIDIMO ERRORS KOJI SE ODNOSE NA MISSING MODULE
