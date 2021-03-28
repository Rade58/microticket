# SURPRISING COMPLEXITY AROUND ERRORS

DAKLE U PROSLOM BRANCH-U SAM PRAVIO REQUESTS PREMA MOM MICROSERVICE-U

- `http http://microticket.com/api/users/signup email=adamfried@gmail.com password=""`

I OVO JE BIO RESPONSE, ONDA KADA JE PROVIDED PASSWORD BIO INVALID

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 81
Content-Type: application/json; charset=utf-8
Date: Sun, 28 Mar 2021 18:24:21 GMT
ETag: W/"51-PWTxV/LbFOkifLsQcShM1Lef938"
X-Powered-By: Express

[
    {
        "location": "body",
        "msg": "Pssword must be valid",
        "param": "password",
        "value": ""
    }
]
```

AKO POSMATRAS JSON DATA, KAKVU JE KREIRAO, UPRAVO KORISCENJE FUNKCIJE IZ PAKETA `express-validator` VIDIS KAKVA JE STRUKTURA

KREATIOR OVOG PAKETA JE MISLIO DA JE NAJBOLJE DA PROVIDE-UJE OVAKAKV OUTPUT U SLUCAJU NEKE NEVALIDNOSTI, ZATO JE SVOJ LIBRARY TAKO I PRAVIO

DAKLE IMAS NEKAKAV OVKAV JSON

```json
[
    {
        "location": "body",
        "msg": "Pssword must be valid",
        "param": "password",
        "value": ""
    }
]
```

**SADA AMISLI DA TI IMAS MNOSTVA MICROSERVICE, I DA NEKI KORISTE RAZLICITE LIBRARY-JE, A DA NEKI KORISTE I RAZLICIT LANGUAGE, MOZDA RUST, MOZDA PYTHON**

**I SVI ONI OUTPUT-UJU ERROR MESSAGES U RAZLICITIM FORMATIMA**

**TO BI BIO VELIKI PROBLEM, JER DA IMAS REACT APPLICATION, KOJI PRAVI RQUESTS KA SVIM TIM SERVICE-IMA, JASNO BI TI BILO DDA BI TAJ REACT APP MORAO ZNATI ZA SVE TE FORMATE ERROR-A**

**`DAKLE MICROSERVICES TI MORAS PRAVITI NA TAKAV NACIN DA U SLUCAJU ERROR-A, ONI SALJU RESPONSE SA DATOM, KOJA BI BILA U ISTOM FORMATU OD SERVISA DO SERVISA`**

I SAM VIDIS ZA KOLIKU KOMPLEKSNOST BI MORALA DA ZNA REACT APLIKACIJA, DA HANDL-UJE SVE TE RESPONSES, KOJI BI IMALI JSON DATA U RAZLICITIM FORMATIMA

TO JE PREVELIK WEIGHT ZA, NA PRIMER FTRONT END ENGINEERA, KOJI BI RADIO NA REACT APP-U

TVOJ REEACT APP TREBALO BI DA ZNA SAMO DA PARSS-UJE EXACTLLY ONE TYPE OF ERROR RESPONSE

# IMAM DVE OGROMENE POTESKOCE U ERROR HANDLINGU

1. MORAMO IMATI CONSISTENTLY STRUCTURED RESPONSE FROM ALL OF MY SERVERS NO MATTER WHAT WENT WRONG

2. MILIJARDE STVARI CAN GO WRONG, NE SAMO VALIDACIJA INPUTA U REQUEST HANDLER-U; MOZE ZAKAZATI DATABASE, MOZE SE DESITI BILO STA ,I SVE I OD TOGA MORA BITI HANDLED SA KONSTANTNOSCU 

RESENJE NA PRVU STVAR:

PISANJE ERROR HANDLING MIDDLEWARE-OVA ZA PROCESSING ERROR-A, DATI IM CONSISTENT STRUCTURE, I POSLATI IH TAKVE DO BROWSER-A

RESENJE NA DRUGU STVAR

KORISTI EXPRESS-OV ERROR HANDLING MECHANISM (POZIVAJ next FUNKCIJU U MIDDLEWARE-U); MAKE SURE DA CAPTURE-UJES ALL POSSIBLE ERRORS
