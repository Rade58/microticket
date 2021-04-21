# MANUAL TESTING WITH INSOMNIA

***

**DOBRO JE STO CES RADITI OVAKAV TESTING, JER NA KRAJU SE POKAZALO DA SAM NASAO GRESKU**

***

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
  "id": "608074a5d5fd580019e060ff"
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
    "id": "608074a5d5fd580019e060ff"
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

`"GET"` `https://microticket.com/api/tickets/608074a5d5fd580019e060ff`

**OVAJ DATA SAM DOBIO U RESPONSE-U**

```json
{
  "title": "Stavros is cool",
  "price": 406,
  "userId": "608065f306299c0018282f40",
  "id": "608074a5d5fd580019e060ff"
}
```

## 4. SADA CU DA UPDATE-UJEM ISTI TICKET 

`"PUT"` `https://microticket.com/api/tickets/608074a5d5fd580019e060ff`

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

EXECUTE-OVAO SAM REQUEST, I U RESPONSE-U SAM DOBIO SLEDECI DATA

```json
{
  "title": "Stavros is cool",
  "price": 406,
  "userId": "608065f306299c0018282f40",
  "id": "608074a5d5fd580019e060ff"
}
```

**DAKLE UPDATE JE BIO NEUSPESAN, JER SAM DOBIO ISTI DATA**

A MOJ POKUSAJ DA OPET UZMEM ISTI DOCUMENT, SLANJEM `"GET"` PREMA `/api/tickets/<ticket-ov id>` JE POKAZO OPET ISTI DATA; DAKLE UPDATE JE BIO NEUSPESAN

**PROBLEM JE U SAMOJ METODI MODELA, KOJU SAM KORISTITO ZA UPDATE; TO JE `findByIdAndUpdate`**

NE ZNAM ZASTO NIJE FUNKCIONISALA, JEDNOSTAVNO SAM PROBO NEKOLIKO STVARI I NIJE FUNKCIONISALA

ODLUCIO SAM DA KORISTIM DRUGU METODU

# ODLUCIO SAM DA KORISTIM `Model.FindOneAndUpdate` KAKO BI PREVAZISAO POMENUTI PROBLEM

- `tickets/src/routes/update.ts`

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("title has invalid format"),
    body("price").isFloat({ gt: 0 }).withMessage("price has invalid format"),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser?.id;
    const { title, price } = req.body;

    const data: { title?: string; price?: number } = {};

    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    // EVO ODLUCIO SAM DA KORISTIM OVU METODU

    ticket = await Ticket.findOneAndUpdate(
      // TRAZIM BY ID
      { _id: id },
      { price: data.price, title: data.title },
      // ZA OVU useFindAndModify OCIJU, DA JE KORISTIS,
      // CE TE SAVETOVATI SAMI LOG U TERMINALU, ZATO SAM JE UPOTREBIO
      { new: true, useFindAndModify: true }
    ).exec();

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

**KREIRAO SAM JEDAN TICKET**

`"POST"` `https://microticket.com/api/tickets/`

body:

```json
{
	"title": "Nick hey",
	"price": 406
}
```

DATA:

```json
{
  "title": "Nick hey",
  "price": 406,
  "userId": "608089c4eedc6e0018ea6301",
  "id": "608089d29cfd7c00184b3135"
}
```

**ONDA SAM POKUSAO DA GA UPDATE-UJEM**

`"PUT"` `https://microticket.com/api/tickets/608089d29cfd7c00184b3135`

body:

```json
{
  "title": "Stavros swims",
	"price": 69
}
```

DATA:

```json
{
  "title": "Stavros swims",
  "price": 69,
  "userId": "608089c4eedc6e0018ea6301",
  "id": "608089d29cfd7c00184b3135"
}
```

**VIDIM DA JE UPDATE BIO USPESAN**

**ALI ZELI MDA PROVERI MDA LI JE BIO STVARNO USPESAN, TAK OSTO CU GET-OVATI TAJ SINGLE DOCUMENT**

`"GET"` `https://microticket.com/api/tickets/608089d29cfd7c00184b3135`

DATA:

```json
{
  "title": "Stavros swims",
  "price": 69,
  "userId": "608089c4eedc6e0018ea6301",
  "id": "608089d29cfd7c00184b3135"
}
```

SVE JE U REDU
