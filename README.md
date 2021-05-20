# DEBUGGING SOME PODS

U PROSLOM BRANCHU, DA TI NE SIRIM PRICU, USPEO SAM NA KRAJU DA NAPRAVIM I APPLY-UJEM SVE K8S MANIFEST FILE-OVE ZA NAS PRODUCTION CLUSTER NA DIGITAL OCEAN-U, **ALI OCIGLEDNO SAM NAPRAVIO PROBLEM, EVO POGLEDAJ**

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS             RESTARTS   AGE
auth-depl-77f5647f8d-9x5kz               1/1     Running            0          4h20m
auth-mongo-depl-6b6f97556-hlncf          1/1     Running            0          4h21m
client-depl-5bbbbf674f-kxgpf             0/1     ImagePullBackOff   0          76m
client-depl-78f896bbd7-bhvfq             0/1     ImagePullBackOff   0          4h21m
expiration-depl-5b6b6bfcd5-ctzdd         0/1     CrashLoopBackOff   15         56m
expiration-redis-depl-55c656669f-fc6wv   1/1     Running            0          4h21m
nats-depl-68b7d794b4-hr85z               1/1     Running            0          4h21m
orders-depl-77688c6b9f-ltttz             1/1     Running            0          76m
orders-mongo-depl-6b554544d8-ff25q       1/1     Running            0          4h21m
payments-depl-5b9f649cd9-zgsb7           1/1     Running            0          76m
payments-mongo-depl-76ffcb78fb-52tsb     1/1     Running            0          4h20m
tickets-depl-554dd4bd79-s9svm            1/1     Running            0          76m
tickets-mongo-depl-8546d98f5b-zn2kb      1/1     Running            0          4h20m

```

DA ODMAH NE SIRIM PRICU, VIDIM DA JE PROBLEM U IMAGE-U ZA client MICROSERVICE

TO JE ZBOG POGRESNOG IMAGE-A, JER SAM DEFINISAO `infra/k8s/client-depl.yaml` DAKLE INSIDE `infra/k8s`, A NE ODVOJENA DVA MANIFESTA U `infra/k8s-prod` I `infra/k8s-dev`

TO SAM URADIO, DAKLE NEMAMVIDE `infra/k8s/client-depl.yaml`

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

OPET CEMO NAPRAVITI PULL REQUEST ZA MERGING dev BRANCH INTO MAIN

NECU TI OBJASNAJVATI STA CU SVE RADITI, JER SAM TI OBJASNIO 15 PUTA DO SADA, AKO TE ZNIMA KAKO IDE PRAVLJANJE PULL REQUESTA POGLEDAJ PROSLE BRANCH-EVE
