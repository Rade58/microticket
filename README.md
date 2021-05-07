# KORISCENJE DATABASE-A INSIDE POD, AS DATBASE ADMINISTRATOR

DOBRO BI BILO DA DIREKTNO PRISTUPIM DATABASE-U; **ODNOSNO PRISTUPITI MONGO SHELL-U** INSIDE POD I DA, TAKO MOZDA NAPRAVIM PAR DOKUMNATA, KROZ CLI, I DA TAKO TESTIRM PRAVLJENJE, UPDATE-OVANJE DOKUMENATA, NA TAKAV DIREKTAN NACIN

TADA DIREKTNO MOGU VIDETI, KAKO SE ONAJ version POVECAVA, I DA LI SE UOPSTE POVECAVA PRI UPDATING-U

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-df48d76f8-nvslx             1/1     Running   0          15m
auth-mongo-depl-7fbb4bb65c-mktb7      1/1     Running   0          15m
client-depl-5d8dc8d44c-qlcsb          1/1     Running   0          15m
nats-depl-97c594bdc-s6vwm             1/1     Running   0          15m
orders-depl-54d75f5bdb-zthtq          1/1     Running   0          15m
orders-mongo-depl-8dbb45899-5779j     1/1     Running   0          15m
tickets-depl-55f6bc676b-zkhmz         1/1     Running   0          15m
tickets-mongo-depl-79665db667-cst7t   1/1     Running   0          15m
```

**SADA CU OTVORITI MONGO SHELL INSIDE POD**

- `kubectl exec -it tickets-mongo-depl-79665db667-cst7t mongo`

SADA MOGU DA RADIM OVAKAVE STVARI

- `show dbs`

```sh
admin    0.000GB
config   0.000GB
local    0.000GB
tickets  0.000GB
```

- `use tickets`

```sh
switched to db tickets
```

**ACCESS-UJEMO Tickets KOLEKCIJU U tickets DATBASE-U**

- `db.tickets`

```zsh
tickets.tickets
```

**SADA CEMO DA PREDJEMO U INSOMNIU, I DA NAPRAVIMO JEDAN TICKET** (OVO RADIM U INSOMNII JER TAMO IMAM AUTHENTICATED USER-A, A OVDE ME MRZI DA PASS-UJEM IN MANUELNO userId)

SADA CEMO U MONGO SHELL-U DA POKUSAMO DA NADJEMO TAJ TICKET

- `db.tickets.find("60950be29c0ee10018de3f8d")`

```sh
{ "_id" : ObjectId("60950be29c0ee10018de3f8d"), "title" : "Mastodon", "price" : 6999, "userId" : "608089c4eedc6e0018ea6301", "version" : 0 }
```

**SADA CEMO U INSOMNII DA UPDATE-UJEMO TICKET**

POSLE TOGA VRACAM OSE U MONGO SHELL DA VIDIMO DA L ISE TICKET UPDATE-OVAO,  IDA L ISE version UPDATE-OVAO

- `db.tickets.find("60950be29c0ee10018de3f8d")`

```sh
{ "_id" : ObjectId("60950be29c0ee10018de3f8d"), "title" : "Mastodon", "price" : 402402, "userId" : "608089c4eedc6e0018ea6301", "version" : 1 }

```

KAO STO VIDIS version JE ZAISTA PROMENJEN I SADA JE 1

ZAVRSIO SAM SA OVIM, NECU VISE NISTA RADITI IZ MONGO SHELL-A

- `exit`
