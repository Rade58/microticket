# MANUAL TESTING WITH INSOMNIA

IAKO SAM JA TOKOM KREIRANJA tickets MICROSERVICE-A, KORISTIO TAKOZVANI TEST-FIRST APPROACH, DOBRO JE NAPAVITI I MANUELNI TEST

## MEDJUTIM MI JOS NISMO U INGRESS NGINX KONFIGURACIJI SPECICIRALICLUSTER CLUSTER IP SERVICE, ZA tickets MICROSERVICE

TAKO DA CU TO SADA URADITI

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   7d23h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    7d23h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    7d23h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     25d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   2d21h
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    2d21h
```

DAKLE TAJ CLUSTER IP SERVICE JESTE tickets-srv

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
          # DODAO SAM OVO I TO NA OVOM MESTU
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

**DA SUPER IMPORTANT JE DA SMO TAMO UMETNULI GORNJU KONFIGURACIJU (PRE SPECIFIKACIJE ZA client POSTO ON IMA THE CATCH ALL ROUTES (`?(.*)`)); JER DA JE client-srv-OV CATCH ALL ROUTES BILO NA POCETKU, INGRESS NGINX BI SVE REQUEST PROSLEDIO TOM SERVICE-U**

DAKLE KADA DO INGRESS NGINX DA ODJE REQUEST PREMA SPECIFICIRANOM PATH-U, ON CE BITI FORWARDED DO NASEG tickets MICROSERVICE-A

ALI SADA TI MORAS DA APPLY-UJES CHANGES NA NASEM CLUSTERU NA GOOGLE CLOUD-U

TO RADIM POKRETANJEM SKAFFOLD-A

- `skaffold dev`

SADA KADA JE SKAFFOLD ODRADIO SVOJE, MOZES POCETI SA MANUELNIM TESTIRANJEM `tickets` MICROSERVICE-A

# DAKLE TESTIRAMO SA INSOMNIOM

ALI PAR STVARI KOJE MORAMO ZNATI; SAMO TE PODSECAM NA NJIH

POSTO KORISTIMO "FAKE" HTTPS, TAKORECI, MORAMO DA UNCHECK-UJEMO `Validate Certificates` OPCIJU U SETTINGSIMA INSOMMNIE

MORAMO PRVO NAPRAVITI NOVOG USER-A DA BI IMALI COOKIE (NE BRINI DALJE O COOKIE-U VODI RACUNA INSOMNIA, ONA CE GA UVRSTITI U SVAKI FOLLOWUP REQUEST)

A COOKIE NAM MORA BITI PROVIDED JER JE KREIRANJE I UPDATING TICKETA IZISKUJU DA USER-A MORA BITI

***

KREIRAM USER-A

`"POST"` `https://microticket.com/api/users/signup`

body:

```json
{
	"email": "guliana@mail.com",
	"password": "ChillyIsGreat26"
}
```

**USER JE SADA CREATED, POGLEDAO SAM I HEADERS I NASO `set-cookie` HEADER**

DAKLE SVE JE TU U REDU, NADAMO SE DA CE BITI POSALT U SVAKOM FOLLOW UP REQUEST-U, KOJEG CEMO PRAVITI

***

## 1. KREIRACU SADA TICKET

`"POST"` `https://microticket.com/api/tickets/`

body:

```json
{
	"title": "Stavros is cool",
	"price": 406
}
```

**I USPESNO JE KREIRAN TICKET**

OVO JE DATA FROM RESPONSE

```json
{
  "title": "Stavros is cool",
  "price": 406,
  "userId": "608065f306299c0018282f40",
  "id": "60806e70c7f2d80019017230"
}
```

**NAPRAVIO SAM JOS NEKOLIKO TICKET-A**

## 2. SADA CU DA OBTAIN-UJEM SVE TICKETS

`"GET"` `https://microticket.com/api/tickets/`

I EVO KADA SAM EXECUTE-OVAO REQUEST, DOBIO SAM OVAJ DATA

```json
[
  {
    "title": "Stavros is cool",
    "price": 406,
    "userId": "608065f306299c0018282f40",
    "id": "60806e70c7f2d80019017230"
  },
  {
    "title": "Gully is nice",
    "price": 208,
    "userId": "608065f306299c0018282f40",
    "id": "60806ef1c7f2d80019017231"
  },
  {
    "title": "Hello friend",
    "price": 69,
    "userId": "608065f306299c0018282f40",
    "id": "60806f0bc7f2d80019017232"
  },
  {
    "title": "Nick dance",
    "price": 509,
    "userId": "608065f306299c0018282f40",
    "id": "60806f26c7f2d80019017233"
  }
]
```

## 3. OBTAINING SINGLE TICKET BY ID

INSIDE URL STAVIO SAM, ONAJ ID PRVOG TICKETA, KOJEG SAM NAPRAVIO

`"GET"` `https://microticket.com/api/tickets/60806e70c7f2d80019017230`

**OVAJ DATA SAM DOBIO U RESPONSE-U**

```json
{
  "title": "Stavros is cool",
  "price": 406,
  "userId": "608065f306299c0018282f40",
  "id": "60806e70c7f2d80019017230"
}
```

## 4. SADA CU DA UPDATE-UJEM ISTI TICKET 

`"PUT"` `https://microticket.com/api/tickets/60806e70c7f2d80019017230`

***

body:

ZELIM DA PROMENIM SAMO PRICE

**ALI SECAS SE DA SAM NAPRAVIO VALIDACUJU ZA OBA FIELDA**

JA NA PRIMER HOCU DA PROMENIM SAMO `price` I ZATO CU ZA `title` DA PROSLEDIM ISTU VREDNOST

JER KADA BI IZOSTAVIO JEDAN FIELD, IMAO BI VALIDATION ERROR 

```json
{
  "title": "Stavros is cool",
	"price": 166
}
```

***

