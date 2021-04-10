# RUNNING Next.js APP IN KUBERNETES

- `touch infra/k8s/client-depl.yaml`

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

# SADA PRAVIMO SETTING U SKAFFOLD KONFIGUACIJI ZA NAS NOVI DEPLOYMENT I CLUSTERIP; TAM OSPECIFICIRAMO NAS NOVI IMAGE I SYNCING RULES

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
        # NISAM SIGURAN DA LI OVDE TREBA DA SE ZADA
        # PATH POPUT auth/src/**/*.{ts,js}
          - src: 'src/**/*.{ts,js}'
            dest: .
    # OVO SAM DAKLE DODAO
    - image: eu.gcr.io/microticket/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          # NISAM SIGURAN DA LI OVDE TREBA DA SE ZADA
          # PATH POPUT client/**/*.{ts,js}
          # ALI AUTOR WORKSHOPA JE OVAKO ZADAO, PA SAM I JA OVO ZADAO
          - src: '**/*.{tsx,ts,js}'
            dest: .
```



