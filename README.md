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

# MORAMO DA UPDATE-UJEMO INGRESS NGINX KONFIGURACIJU

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
          # DODAO SAM OVO
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

**DA TI JOS JEDNOM POJASNIM ZASTO MORA `/?(.*)` I ZASTO MORA NA KRAJU**

***

PA ZATO STO JE LEAST SPECIFIC PATH, AKO SE SVI GORNJI PATH-OVI NE MATCH-UJU, MOJ NEXTJS APP CE BITI SERVED NA

`microticket.com/`

ILI 

`microticket.com/<neki path koji nije jedan od onih gore specificiranih>`

***

# SADA U ROOT-U TVOG CELOKUPNOG PROJEKTA, MOZES DA START-UJES SKAFFOLD

***

IMAO SAM DOSTA ERRORA KOJI SU ME NAVELI DA REINSTALIRAM NEKE DEV DEPENDANCIES PA DA IH INSTALIRAM KAO DEPENDANCIES

NALON CEGA JE SVE RADILO

OVO SE DESILO JER SU IMAGE-OVI KOMPLETNO REBUILDED, A ZATO STO JA U DOCKERFILE-U VOLIM DA KORITIM --only=prod KOD NEKIH DEPENDANCIES-A, DA NE BI IZAZVAO KOMPLETAN IMAGE REBUILD

***

- `skaffold dev`

UGLAVNOM NAKON STO SAM TYPESCRIPT I JOS NEKE TYPE DEFINISTIONS U SLUCAJU OBA MICROSERVICE-A (I client I auth), SVE JE FUNKCIONISALO KAKO TREBA, NAKON POKRETANJA SKAFFOLD-A

MOCI CES DA ODES NA

<http://microticket.com/> ILI NA `http://microticket.com/<bilo sta sto nije neki od drugih definisanih rout-ova u ingress-u>`

**NARAVNO, KAA ODES NA <http://microticket.com/> TVOJ NEXTJS PAGE BICE SERVED**

**ALI KADA ODES NA `http://microticket.com/<bilo sta sto nije neki od drugih definisanih rout-ova u ingress-u>`; NEXTJS SERV-UJE SVOJ DEFAULT 404 PAGE**
