# CONFIGURING THE DOMAIN NAME

KUPILI SMO `microticket.xyz` DOMAIN NAME U PROSLOM BRANCH-U

IDEM SADA U NAMECHEAP DASBOARD, I OTVARAM DOMAIN LIST, I BIRAM POMENUTI DOMAIN NAME, ODNOSNO PRITISKAM NA `MANAGE` DUGME, ZA TAJ DOMAIN NAME

***

digresija:

PRE TOGA MOZES PRIMAETITI DA TVOJ DOMAIN NAME IMA `Auto-Renew` CHECKED OUT; **E PA UNCHECK-UJ TO DA ZA GODINU DANA NE BI BIO BILLED, ODNOSNO DA AUTOMATSKI NE BI RINAJMIO DOMAIN**

***

TU MOGU CHANGE-OVATI KAKO DA SE PONASA, OVAJ DOMAIN NAME

**PROMENICEMO JEDINO `NAMESERVERS` ILI DNS SERVERS**

ZA OVU OPCIJU BIRAJ `Custom DNS`

**I TU ODMAH UNOSIMO 3 CUSTOM DNS-A, ODNOSNO TI CUSTOM NAME SERVERA, KOJA SU PROVIDED BY DIGITAL OCEAN**

DA VIDIS TE DNS-OVE MOZES OTICI U DIGITAL OCEAN DASBOARD, I TAMO IDI DA `Create` -> `Domains/DNS`

UNESI TAMO DOMAIN NAME `microticket.xyz` ZA PROJECT U KOJEM JE NAS CLUSTER A TO JE `microticket_project` I PRITISNI NA `Add Domain`

KADA SE TO ODRDI ODMAH CE TI BITI PRIKAZANI DNS RECORDS, I ONA TRI DNS-A

**KOPIRAJ IH I DODAJ IH U NAMECHEP-U I POMENUTOJ NEAMESERVERS SEKCIJI ZA TVOJ DOMAIN** PRITISNI NA GREEN CHECKMARK

RECENO MI JE DA DNS SETUP, ODNON DNS SERVER UPDATE MOZE POTRAJATI I DO 48 SATI

## SADA CEMO SE VRATITI U DIGITAL OCEAN U `MANGE`->`Networking`->`Domains` I BIRAJ NAS DOMAIN (microticket.xyz)

OVDE MOZEMO PODESAVATI COUPLE OF DIFFERENT SETTINGS

MOZE DODATI NSOME NEW RECORDS TO CUSTOMIZE HOW DOMAIN NAME BEHAVES

**UNECU DVA ADDITIONAL RECORDS**

***

- U `A` TABU SAM (ZNACI DEFINISEMO `A RECORD`)

IMAS ONAJ HORIZONTALNI FORM, U KOJI PRVO UNOSIS `HOSTNAME` PA `WILL DIRECT TO` I `TTL(SECONDS)`

1. ZA *'HOSTNAME'* UNOSIS `@` 

2. ZA *'WILL DIRECT TO'* PRONALAZIS LOAD BLANCER-A KOJEG IMMO (AAKO NE ZNAS STA JE SA LISTE LOAD BLANCER, VRATI SE U `Networking`->`Load Ballancers` ,ALI BICE TI JASNO STA JE LOAD BALANCER)

3. *'TLL'* (*'TIME TILL LIVE'*) MENJAM NA `30` SEKUNDI

I PRITISKAM NA `Create Record`

***

- SADA KLIKCEMO NA `CNAME` TAB DA TAMO NAPRAVIMO NOVI RECORD

1. ZA *'HOSTNAME'* KUCAMO `www`

2. A ZA *'IS AN ALIAS OF'*, KUCAMO `@`

3. `*'TTL'*` MENJAMO NA `30` SEKUNDI

I PRITISKAM NA `Create Record`

# SADA MORAMO DA ODEMO NA NAS INGRESS NGINX CONFIG FILE (infra/k8s-prod/ingress-srv.yaml) ,I TAMO MORAMO DA KAZEMO: WHEN EVER IS RUNNING IN PRODUCTION MODE, DA ZELIMO DA INGRESS CONTROLER WATCH-UJE FOR REQUEST COMING FROM DOMAIN OF `microticket.xyz`

- `code infra/k8s-prod/ingress-srv.yaml`

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
    # EVO OVDE SMO ZADALI HOST microticket.xyz
    # ALI MORAS DA DODAS www ISPRED
    - host: www.microticket.xyz
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
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

SADA MORAMO PROCI ONAJ PROCES OD COMMITING-A SVEGA PA DO PRWVLJANJA PULL REQUEST-A, PA NJEGOVOG MERGING-A INTO `main`, NAKON KOJEG SE DOGADJA ACTION, KOJI SMO DEFINISALI DA SE TRIGGER-UJE PRI PUSHINGU INTO `main` (JER OPET TI NAPOMINJEM DA SE MERGING INTO `main` RACUNA KAO I PUSHING INTO `main`)

A SAMO TI NAPOMINJEM DA SE TAJ ACTION OBAVLJA JER SMO DEFINISALI OVAJ WORKFLOW: `.github/workflows/deploy-manifests.yml`




***


***
***
***
***
***
***
***

TAKODJE SAM PRIMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`


***
