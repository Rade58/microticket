# RESTARTING NATS STREAMING SERVER

DAKLE JA SAM NAPRAVIO DOSTA EVENTOVA TOKOM RADA SA NASIM TEST PROJECTOM, U KOJEM SMO TRYOUT-OVALI NATS STREAMING I RADILI OSTALE STVARI

A KORISTILI SMI I ONAJ "ticket:created" CHANNEL

EMITOVALI SMO NEKI PROIZVOLJAN DATA, KOJI SIGURNO ILI MOZDA NIJE VALID

ZATO CEMO DA RESTART-UJEMO NATS STREAMING SERVER, PRE NEGO STO NASTAVIMO DALJE

## TO CEMO URADITI TAKO STO CEMO RESTARTOVATI POD U KOJEM SE NALAZI NAS NATS STREAMING SERVER

OVO CE URADITI DA SE, SVI EVENT-OVI STORED BY NATS DUMP-OVATI

JER SECAS SE DA NATS STORE-UJE EVENTS IN MEMORY PO DEFAUTU

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          3d22h
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          3d22h
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          3d22h
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          3d22h
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          3d22h
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          3d22h
```

- `kubectl delete pod `
