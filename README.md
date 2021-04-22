# BUILDING DEPLOYMENT FOR NATS STREAMING SERVER; TAKODJE BUILD-UJEM CCONFIG ZA CLUSTER IP SERVICE

SIMILAR TO OTHER THAT I ALREADY HAVE ,I'M MAKING THIS DEPLOYMENT

- `touch infra/k8s/nats-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nats-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nats
  template:
    metadata:
      labels:
        app: nats
    spec:
      containers:
      - name: nats
        # OVO CE BITI BITNO (MISLI MDA MORAM OVU VERZIJU)
        image: nats-streaming:0.17.0
        # SET KOMANDI KKOJI CE SE EXECUTE-OVATI KADA SE BUILD-UJE NAS IMAGE
        # MOGU IH NACI NA STRANICI
        args: [
          #
          '-p',
          '4222',
          #
          '-m',
          '8222',
          #
          '-hbi',
          '5s',
          #
          '-hbt',
          '5s',
          #
          '-hbf',
          '2',
          #
          '-SD',
          #
          '-cid',
          'microticket'
        ]
---
apiVersion: v1
kind: Service
metadata:
  name: nats-srv
spec:
  selector:
    app: nats
  ports:
    # DODACU DVA PORT-A
    - name: client
      protocol: TCP
      port: 4222
      targetPort: 4222
    - name: monitoring
      protocol: TCP
      port: 8222

```

OBJASNJENJA ZA KOMANDE KOJE SAM PODESIO U ARRAY-U, NALAZE SE IN `Commandline Options` NA PAGE-U <https://hub.docker.com/_/nats-streaming>

ALI CU KASNIJE J OBJASNITI TE OPCIJE

## SADA CU DA APPLY-UJEM OVAJ CCONFIG POKRETANJEM SKAFFOLD-A

- `skaffold dev`

PRINT OUT-OVACU SADA SVE PODS KOJI RUNN-UJU U MOM CLUSTERU

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          97s
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          97s
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          96s
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          96s
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          96s
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          96s

```

GORE MOGU VIDETI **nats-depl-**
