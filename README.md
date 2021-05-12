# PUTTING STRIPE SECRET KEY INSIDE K8S SECRET OBJECT IN OUR CLUSTER

DAKLE U NASEM STRIPE DASBOARD-U MOZEMO PROCITATI SECRET KEY I PUBLISHABLE KEY

**A MI CEMO SADA DA STAVIMO SECRET KEY INSIDE SECRET OBJECT U NASEM CLUSTERU**

- `kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=<tvoj stripe secret key>`

DA PROVERIM DA LI JE KREIRAN

- `kubectl get secrets`

```zsh
NAME                  TYPE                                  DATA   AGE
default-token-f4zjf   kubernetes.io/service-account-token   3      45d
jwt-secret            Opaque                                1      36d
stripe-secret         Opaque                                1      35s

```

USPESNO SAM DAKLE NAPRAVIO SECRET OBJECT

# SADA CU DA NAPISEM DO CONFIG-A, DA `STRIPE_KEY` UCITAM, KAO ENVIROMENT VARIABLE, INSIDE POD, U KOJEM RUNN-UJE NAS `payments` MICROSERVICE

VEC SI OVO RADIO RANIJE U SLUCAJU `auth` MICROSERVICE-A, GDE SI UCITAVAO `JWT_KEY` ENVIROMNT VARIABLE (ALI MISLIM DA SMO GA UCITAVALI I U DRUGIM MICROSERVICE-OVIMA ,KADA SMO KOPIRALI I PREPRAVLJALI KONFIGURACIJE)

- `code infra/k8s/payments-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  # OVO JE VAZNO, VIDECES I ZASTO
  name: payments-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: payments
  template:
    metadata:
      labels:
        app: payments
    spec:
      containers:
        - name: payments
          image: eu.gcr.io/microticket/payments
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
              value: 'mongodb://payments-mongo-srv:27017/payments'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
            # -- EVO DEFINISEMO OVO --
            - name: STRIPE_KEY
              valueFrom:
                secretKeyRef:
                  name: stripe-secret
                  key: STRIPE_KEY
            # ------------------------
---
apiVersion: v1
kind: Service
metadata:
  name: payments-srv
spec:
  selector:
    app: payments
  type: ClusterIP
  ports:
    - name: payments
      protocol: TCP
      port: 3000
      targetPort: 3000
```

## U SLEDECEM BRANCH-U INICIJALIZOVACEMO STRIPE SDK U NASEM CREATE CHARGE ROUTE HANDLERU
