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

# SADA OVE FILE-OVE NECU DA PRAVIM DIREKTNO NA GITHUBU, VEC CU IH PRAVITI IZ MOG CODEBASE-A, CISTO DA VIDIM STA CE SE DESITI KADA SVE MERGE-UJEM

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
      # I NEMOJ DA ZABORAVIS DA URADIS cd orders
      - run: cd orders && docker build -t radebajic/mt-orders .
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

NARAVNO TO VOLIM DA RADIM TAKO STO CU U `dev` BRANCH PRVO LOKALNO SVE PROMENE MERGE-OVATI, PA ZELIM TEK ONDA DA PUSH-UJEM `dev`, PA DA NAPRAVIM PULL REQUEST ZA MERGING dev INTO `main` (ZELI MDA STO VISE RDIM TAJ PULL REQUEST DA MI OSTANE U PAMCENJU)

**UGLAVNOM EVO SADA SAM PRESAO U `dev` BRANCH**

I EVO COMMIT-UJEM PROMENE

- `git add -A`

- `git commit -am "mede the rest of deploy-<microseervice> files"`

- `git push origin dev`

### IDEM SADA NA GITHUB DA NAPRAVIM PULL REQUEST ZA MERGING `dev` INTO BASIC BRANCH, A TO JE `main`

OPET OTVARAM TAB `Pull requests` U REPO-U ,PA TAMO CREATUJEM NEW PULL REQUEST ZA MERGING dev INTO main

KREIRAO SAM NOVI PULL REQUEST

SADA CU TAJ PULL REQUEST MERGE-OVATI INTO `main`

PRISTISKAM NA `Merge pull request`

U PROSLOM BRANCHU, DA TI NE SIRIM PRICU, USPEO SAM NA KRAJU DA NAPRAVIM I APPLY-UJEM SVE K8S MANIFEST FILE-OVE ZA NAS PRODUCTION CLUSTER NA DIGITAL OCEAN-U, **ALI OCIGLEDNO SAM NAPRAVIO PROBLEM, EVO POGLEDAJ**

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS             RESTARTS   AGE
auth-depl-77f5647f8d-9x5kz               1/1     Running            0          6h6m
auth-mongo-depl-6b6f97556-hlncf          1/1     Running            0          6h6m
client-depl-68d656897b-99vvz             0/1     CrashLoopBackOff   11         38m
expiration-depl-6d95485745-nw2x9         1/1     Running            11         35m
expiration-redis-depl-55c656669f-fc6wv   1/1     Running            0          6h6m
nats-depl-68b7d794b4-hr85z               1/1     Running            0          6h6m
orders-depl-77688c6b9f-ltttz             1/1     Running            0          3h1m
orders-mongo-depl-6b554544d8-ff25q       1/1     Running            0          6h6m
payments-depl-5b9f649cd9-zgsb7           1/1     Running            0          3h1m
payments-mongo-depl-76ffcb78fb-52tsb     1/1     Running            0          6h6m
tickets-depl-554dd4bd79-s9svm            1/1     Running            0          3h1m
tickets-mongo-depl-8546d98f5b-zn2kb      1/1     Running            0          6h6m
nning            0          4h20m
```

DA ODMAH NE SIRIM PRICU, VIDIM DA JE PROBLEM U IMAGE-U ZA client MICROSERVICE

TO JE ZBOG POGRESNOG IMAGE-A, JER SAM DEFINISAO `infra/k8s/client-depl.yaml` DAKLE INSIDE `infra/k8s`, A NE ODVOJENA DVA MANIFESTA U `infra/k8s-prod` I `infra/k8s-dev`

TO SAM URADIO, DAKLE NEMAM VISE `infra/k8s/client-depl.yaml`

VEC IMAM:

- `cat infra/k8s-dev/client-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
      - name: client
        # SA OVIM IMAGE-OM KOJ ISE UZIMA IZ REGISTRY-JA
        # JER TAMO JE MOJ DEVELOPMENT CLUSTER
        image: eu.gcr.io/microticket/client
---
apiVersion: v1
kind: Service
metadata:
  name: client-srv
spec:
  selector:
    app: client
  type: ClusterIP
  ports:
    - name: client
      protocol: TCP
      port: 3000
      targetPort: 3000

```

**I KREIRAO SAM SLEDECI FILE**

- `infra/k8s-prod/client-depl.yaml`

I ON CE IMATI DRUGI IMAGE, ONAJ ZA KOJEG SAM SPECIFICIRAO DA GA BUILD-UJE GITHUB ACTION I DEPLOY-UJE TO DOCKER HUB

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
      - name: client
        # EVO OVO JE PRAVI IMAGE, OD KOJEG CU KORISTITI U POD-U
        # INSIDE PRODUCTIO NCLUSTER
        image: radebajic/mt-client
---
apiVersion: v1
kind: Service
metadata:
  name: client-srv
spec:
  selector:
    app: client
  type: ClusterIP
  ports:
    - name: client
      protocol: TCP
      port: 3000
      targetPort: 3000
```

OPET CEMO NAPRAVITI PULL REQUEST ZA MERGING dev BRANCH INTO main

NECU TI OBJASNAJVATI STA CU SVE RADITI, JER SAM TI OBJASNIO 15 PUTA DO SADA, AKO TE ZNIMA KAKO IDE PRAVLJANJE PULL REQUESTA POGLEDAJ PROSLE BRANCH-EVE

# NAPRAVIO SAM PULL REQUET, PA SAM ONDA MERGE-OVAO TAJ PULL REQUEST INTO `main`

POSMATRAO SAM I KAKO SE OBAVLJA ACTION `.github/workflows/deploy-manifests.yml`, I SAMO JEDAN DEPLOYMENT JE PROMENJEN I RESTART-OVAN (OVO JE PISLO U JEDNOM INE-U U LOG-U: `deployment.apps/client-depl configured`, DOK JE ZA SVE OSTALE PISALO `"unchanged"`)

TAKODJE SAM PRIMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`


***

DA VIDIM DA LI IMAM PRAVI `kubectl` CONTEXT

- `kubectl config current-context` (MOZES DA KORISTIS I `kubectl config get-contexts` ILI `kubectl config view`) (AKO NEMAS PRAVI CONTEXT, MENJAS GA SA `kubectl config use-context <ime context-a>`) (**IMAO SAM THE RIGHT CONTEXT**)

DA SADA PROVERIM PODS

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS    RESTARTS   AGE
auth-depl-668bfbc668-njs6c               1/1     Running   0          2m7s
auth-mongo-depl-6b6f97556-hlncf          1/1     Running   0          6h16m
client-depl-79fcc8678b-kx7rw             1/1     Running   0          2m9s
expiration-depl-7576d8cdb9-wnnhb         1/1     Running   0          2m18s
expiration-redis-depl-55c656669f-fc6wv   1/1     Running   0          6h16m
nats-depl-68b7d794b4-hr85z               1/1     Running   0          6h16m
orders-depl-6f6854b5bd-8l5w9             1/1     Running   0          2m10s
orders-mongo-depl-6b554544d8-ff25q       1/1     Running   0          6h16m
payments-depl-cd4b7c878-vwldz            1/1     Running   0          2m7s
payments-mongo-depl-76ffcb78fb-52tsb     1/1     Running   0          6h16m
tickets-depl-66c4b4ccd4-b6jpx            1/1     Running   0          2m3s
tickets-mongo-depl-8546d98f5b-zn2kb      1/1     Running   0          6h16m

```

**IZGLEDA DA SVE FUNKCIONISE**

MOZEMO DA POGLEDAMO LOGS IZ NEKIH POD-OVA

- `kubectl logs expiration-depl-7576d8cdb9-wnnhb`

```zsh
> expiration@1.0.0 start /app
> ts-node-dev src/index.ts

[INFO] 23:25:12 ts-node-dev ver. 1.1.6 (using ts-node ver. 9.1.1, typescript ver. 4.2.4)

          Connected to Nats Streaming Server
          clientId: expiration-depl-7576d8cdb9-wnnhb

```

SVE IZGLEDA U REDU

- `kubectl logs client-depl-79fcc8678b-kx7rw`

```zsh
> client@1.0.0 dev /app
> next

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
info  - Using webpack 4. Reason: future.webpack5 option disabled https://nextjs.org/docs/messages/webpack5
Development
event - compiled successfully
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

Development

```

I OVDE JE SVE U REDU

# A DA TI NESTO NIJE BILO U REDU, NEKAKV POCETAK DEBUGGINGA BI TEKAO OVAKO

KORISTIO BI `kubectl describe pod <iime poda-a>` KOMANDU 

- `kubectl describe pod orders-depl-6f6854b5bd-8l5w9`

```zsh
Name:         orders-depl-6f6854b5bd-8l5w9
Namespace:    default
Priority:     0
Node:         pool-microticket-8b91g/10.114.0.5
Start Time:   Fri, 21 May 2021 01:25:07 +0200
Labels:       app=orders
              pod-template-hash=6f6854b5bd
Annotations:  kubectl.kubernetes.io/restartedAt: 2021-05-20T23:25:07Z
Status:       Running
IP:           10.244.0.152
IPs:
  IP:           10.244.0.152
Controlled By:  ReplicaSet/orders-depl-6f6854b5bd
Containers:
  orders:
    Container ID:   containerd://b380f52ba88fd4bcb62416707d3d41ed50efc57ae18d3e73df51d1d2414bcd41
    Image:          radebajic/mt-orders
    Image ID:       docker.io/radebajic/mt-orders@sha256:fb0326b0bf8a321138d6ccde5454036b8d117ccfdf230a1c2672076e6220d9d4
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Fri, 21 May 2021 01:25:24 +0200
    Ready:          True
    Restart Count:  0
    Environment:
      NATS_CLIENT_ID:   orders-depl-6f6854b5bd-8l5w9 (v1:metadata.name)
      NATS_URL:         http://nats-srv:4222
      NATS_CLUSTER_ID:  microticket
      MONGO_URI:        mongodb://orders-mongo-srv:27017/orders
      JWT_KEY:          <set to the key 'JWT_KEY' in secret 'jwt-secret'>  Optional: false
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-mwdnw (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  default-token-mwdnw:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-mwdnw
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:          <none>

```

TI MUZES VIDETI NEKI INFO; AKO NESTO CRACH-UJE, MOGAO BI DA NADJES REASONS UPRAVO GORE, A ON OSTO TE PRETEZNO ZANIMA JE EVENTS SEKCIJA, JER TU BI NASAO NEKE PROBLEME VEROVATNO

ALI OVAJ MOJ POD, KOJI SAM PROVERIO JESTE U REDU

ISTO TAKO MOZES KORISTITI, KOMANDU KOJ USAM TI VEC KOKAZAO, A TO JE `kubectl logs <ime pod-a>`

## JOS NE MOGU USPESNO TESTIRATI MOJ CLUSTER, JER JOS NEMAM DOMAIN NAME

TIME CU SE HOPEFULLY POZBAVITI U SLEDECEM BRANCH-U

