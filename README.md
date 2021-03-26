# KUBERNETES SETUP FOR auth MICROERVICE

- `cd auth`

- `touch Dockerfile`

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "start"]

```

- `touch .dockerignore`

```gitignore
node_modules
```

# BUILDING IMAGE

- `cd auth`

- `docker build -t radebajic/tick-auth .`

- `docker push radebajic/tick-build`

# BUILDING CONFIG FOR DEPLOYMEMENT OBJECT; AND CONFIG FOR CLUSTER IP SERVICE FOR auth MICROSERVICE

- `mkdir -p infra/k8s`

- `touch infra/k8s/tick-auth-depl.yaml`

NISAM SPECIFICIRAO TYPE OF SERVICE (ZATO STO JE PO DEFAULTU TO CLUSTER IP SERVICE)

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
          image: radebajic/tick-auth
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

# WRITING SKAFFOLD CONFIGURATION

- `touch skaffold.yaml`

```yaml
apiVersion: skaffold/v2beta13
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: radebajic/tick-auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .

```

# EXECUTE SKAFFOLD TO SEE IS IT WORKING

***
***

MISLIM DA PRE SVEGA MORAS IMATI minikube STARTOVAN `minikube start`; UATVARI IMAO SAM ERRORE SVE DOK NISAM URADIO OVO, PRE RUNNING-A SKAFFOLD-A

- `minikube delete`
- `minikube start`

***
***

- `skaffold dev`

NA KRAJU DOK SE SVE IZVRSI I DOK SE EXECUTE-UJE STARTUP COMMAND, VIDECES DA JE TVOJ auth MICROSERVICE LIVING (MOZES VIDETI OUTPUT TVOG NODEJS SERVERA KADA JE STARTOVAO) I NLAZI SE U CONTAINERU, INSISE RELATED POD, KOJI JE INSIDE RELATED DEPLOYMENNT

- `k get pods`

```zsh
NAME                         READY   STATUS    RESTARTS   AGE
auth-depl-6d5dd787d7-tzwmr   1/1     Running   0          3m40s
```

- `k ged deployments`

```zsh
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
auth-depl   1/1     1            1           3m58s

```

A LIVING LE I TVOJ CLUSTER IP SERVICE ZA auth

- `k ged services`

```zsh
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
auth-srv     ClusterIP   10.107.38.208   <none>        3000/TCP   4m14s
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP    8m5s

```

## MOZEMO MALO DA TESTIRAMO, TAK OSTO CEMO ZADATI DRUGI TEKST U ONOM CALLBACK-U KOJI SE IZVRSI KADA SERVER START-UJE SA LISTENINGOM, I DA VIDIMO DA LI CE SKAFFOLD REBUILD-OVATI DOCKER IMAGE I UBACITI GA U POD, KAKO BI TAJ NOVI IMAGE STUPIO NA SNAGU

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

const PORT = 3000;

app.listen(PORT, () => {
  // UMESTO OVOGA
  // console.log(`listening on port ${PORT}`);
  // OVO
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
```

I ZAISTA JE SKAFFOLD OBAVIO UPDATING VEOMA BRZO
