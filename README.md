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

```
