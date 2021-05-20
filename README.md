# SPLITTING K8S MANIFEST FILES INTO SEPARATE 3 DIRECTORIES; FOR PRODUCTION, FOR DEVELOPMENT, FOR BOTH DEVELOPMENT AND PRODUCTION

NAIME, MI SMO U PROSLOM BRANCH-U DEFINISALI JEDAN WORKFLOW (`/.github/workflows/deploy-auth.yml`) (KOJI U GITHUB CONTAINER-U TREBA DA OBAVLJA RADNJE OD BUILDINGA DOCKER IMAGE, DO NJEGOVOG PUSHINGA TO DOCKER HUB, PA DO INSTLIRANJA doctl KOMANDE, PA NJENOG KORISCENJA ZA INICIJAZLIZACIJU (PRI KOJOJ SE OBAVLJA I AUTHORIZATION VEZAN ZA DIGITAL OCEAN ,ALI PRVENSTVENO SE DESI PROMENA CONTEXTA ZA kubectl), PA DO RESTARTINGA DEPLOYMENT-A ,KORISCENJEM kubectl KOMANDE); 

MI JESMO SVE TO, POMENUTO DEFINISALI ZA JEDAN DEPLOYMENT,  **ALI ONO STO NISMO DEFINISALI JESTE APLYING K8S MANIFEST FILE-OV NA CLUSTER, STO ZNACI DA NE POSTOJI NI JEDAN DEPLOYMENT U NASEM CLUSTERU NA DIGITAL OCEAN-U**

***

digresija:

DA ZAISTA, SVI ONI FILE-OVI U `infra` FOLDERU, NAZIVAJU SE JOS I K8S MANIFESTS

***

MEDJUTIM PRE BILO KAKVOG APLYING-A MANIFEST FILE-OVA NA CLUSTER, JA TI MORAM RECI KOJE PROBLEME IMAMO

KAO PRVO TI NECES KORSITITI `skaffold`, JER ON JE SLUZIO SAMO ZA DEVELOPMENT

A DVA SU PROBLEMA TU PREVENSTVENO U POGLEDU TOGA, STA PISE U TIM MANIFEST FILE-OVIMA

1. PROBLEM 1

- `cat infra/k8s/ingress-srv.yaml`

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
    # OVO JE PROBLEM
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
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              serviceName: orders-srv
              servicePort: 3000
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              serviceName: payments-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

UNUTAR GORNJEG FILE, KOJI PREDSTAVLJA INGRESS KONFIGURACIJU DEFINISAO SAM DA KADA GOD USER ODE NA HOST `microticket.com`, DA JA ZELIM DA SE APLICIRA SET OF ROUTING RULES, ODNOSNO REDIRECT RULES, KOJE SAM SPECIFICIRAO

**E PA HOST JE PROBLEM JER JE FAKE HOST**, `A M IZELIMO DA DEPLOY-UJEMO NASU APLIKACIJU NA OPEN INTERNET, A ZA TO CE NAM TREBATI DOMAIN NAME, KOJI CEMO KUPITI, I POINT-OVACEMO AT OUR APPLICATION; I NARAVNO TAJ DOMAIN NAME CE BITI RAZLICIT OD ONOG KOJI JE SADA SPECIFICIRAN`

2. PROBLEM 2 (KOJI AUTOR WORKSHOPA NEMA JER JE DEVELOPOVAO NA SVOM RACUNARU, A NE NA GOOGLE CLOUD-U KAO JA)

**SAVAKI OD, MOJIH MANIFEST FILE-OVA**, KOJI REPREZENTUJU DEPLOYMENS I CLUSTER IP KONFIGURACIJE, **USTVARI IMAJU SPECIFICIRAN IMAGE, `ALI NE IIMIGE IZ DOCKER HUB-A`, VEC U FROM REGISTRY ON GOOGLE CLOUD**

EVO VIDI

- `cat infra/k8s/auth-depl.yaml`

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
          # EVO VIDIS, TO JE TAJ IMAGE
          image: eu.gcr.io/microticket/auth
          # I TO NIJE IMAGE radebajic/mt-auth   KOJI SMO
          # SPECIFICIRALI U WORKFLOW FILE-U ZA GITHUB ACTION
          # KOJI NA KRAJU TREBA DA REBUILD-UJE IMAGE
          env:
            - name: MONGO_URI
              value: 'mongodb://auth-mongo-srv:27017/auth'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
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
