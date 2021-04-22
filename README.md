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

