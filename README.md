# UPDATING SKAFFOLD CONFIG

MORAM RECI SKAFFOLD-U DA BUILD-UJE IMAGE-OVE, UZ POMOC ONOG `Google Cloud Build`-A KOJI SE NALAZI NA GOOGLE CLOUD-U

DAKLE RANIJE SAM TI VEC REKAO A CU KORISTI GOOGLE CLOUD ZA BUILDING MOJIH IMAGE-OVA (I TO CE BITI FAST POGOTOVO ONDA KADA BUDEM INSTALIRAO LARGE DEPENDANCIES)

# ENABLING GOOGLE CLOUD BUILD

U DASBOARD-U (UNDER HAMBURGER MENU) GOOGLE CLOUD-A, UNDER Tools PRONADJI `Cloud Build` I KLIKNI NA TO

KLINI ONDA NA `Enable`, I TO CE POTRAJATI MINUT DVA

# SADA CU DA REDEFINISEM SKAFFOLD CONFIG

- `code skaffold.yaml`

RECI CU MU DA ZELI MDA KORISTIM GOOGLE CLOUD BUILD

```yaml
apiVersion: skaffold/v2beta13
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  # UKLONIO local JER NE RADIM VISE LOCAL BUILD
  # local:
  #   push: false
  # DODAO OVO
  googleCloudBuild:
    projectId: microticket
  artifacts:
      # REDEFINISAO IMAGE NAME
    - image: us.gcr.io/microticket/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .

```

VIDIS KAKO JE ID microticket, A I NAME PROJECTA MI JE microticket (OVO NE MORA DA BUDE UVEK ZATO DOBRO PREGLEDAJ KOJI JE ID TVOG PROJECT-A)

ISTO TAKO UPDATE-OVAO SAM I NAME DOCKER IMAGE-A, JR ZA TO JE ODGOVORAN GOOGLE CLOUD BUILD KOJI CE ASSIGN-OVATI STRUCTURED NAME KADA BUDE BUILD-OVAO IMAGE

ZATO SAM JA ASSIGN-OVAO IMAGE NAME U FORMATU, KOJ IVIDISA SA `us.gcr.io/<id project-a>` + `context`(folder name)

# IMAGE JE BIO REFERENCED U DEPL FILE-U, TAKO DA TO MORAM DA RREDEFINISEM

- `code infra/k8s/auth-depl.yaml`

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
          # EVO OVO SAM PROMENIO
          image: us.gcr.io/microticket/auth
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
