# AUTHENTICATION STRATEGIES AND OPTIONS

U PROSLOM BRANCH-U SAM USPESNO DEFINISAO KREIRANJE USER-A, UZ SVE STO JE ISLO UZ TO (PASSWORD HASHING I OSTALO)

USER SE KREIRA HITTING-OM `/signup` ROUTERA

**ONO STA NISAM URADIO JE ISSUING JWT-A** (TO JE NACIN AUTHENTICATION-A KOJ ISAM RANIJE KORISTIO (JSON WEB TOKEN JE PROOF DA JE USER SIGNED IN))

**STO SE TICE MICROSERVICE-OVA, SETTING UP AUTHENTICATION-A JE VEOM CHALLENGING**

# POGLEDAJ OVO DA VIDIS KAKO JE AUTHENTICATION USTVARI VELIKI PROBLEM INSIDE MICROSERVICE ARCHITECTURE

1. `USER AUTH WITH MICROSERVICES JE UNSOLVED PROBLEM` (**DAKLE TO JE USTVARI NERESEN PROBLEM**)

2. **POSTOJI MNOGO NACINA DA SE TO URADI, I NI JEDAN NIJE THE RIGHT WAY**

## JA CU, TOKOM OVOG DELA WORKSHOP-A, OUTLINE-OVATI NEKOLIKO SOLUTION-A, THT WORKS, ALI SVAKI IMA DOWNSIDE

TI PRINCIPI MOGU KORISTITI JEDNU OD OVE DVE STVARI, BEZ OBZIRA KOJI OD NACINA KORISTIM

- KORISCENJE JWT-A

- KORISCENJE SESSION COOKIE-A

A FUNDAMENTALNO POSTOJE DVA NACINA

JA CU IH SADA NAVESTI

# 1. FUNDAMENTAL OPTION: ALLOW-OVATI DA INDIVIDUAL MICROSERVICES RELY ON `auth` MICROSERVICE, WHICH WOULD BE CENTRALIZED AUTHENTICATION MICROSERVICED

NA PRIMER IMAS ORDERS MICROSERVICE, KOJI BI ONDA SLAO SYNC REQUEST (**SYNC REQUEST SAM NAZIOVAO SITUACIJU PO KOJOJ NEMAM EVENT BUS-A, KAO MIDDLE MAN-A**) TO THE AUTH MICROSERVICE, KOJI BI IMAO LOGIKU ZA INSPECTING JWT-A ILI COOKIE-A

I AUTH SERVICE BI ONDA POSLAO RESPONSE NAZAD

**AKO BI AUTH MICROSERVICE WENT-OVAO DOWN SOME DAY, BIO BI U VELIKOM PROBLEMU, JER SVE STO ZAVISI OD AUTH-A E BI FUNKCIONISALO**

## 1.1 FUNDAMENTAL OPTION: INDIVIDUAL MICROSERVICES RELY ON TH auth MICROSERVICE AS A GATEWAY

OVO ZNACI DA CE CLIENT-OVI REQUEST-OVI PRVO DOLAZITI U auth MICROSERVICE

AKO SE DECIDE-UJE DA JE USER AUTHENTICATED, ONDA CE SE REQUEST PROSLEDITI DO APPROPRIATE MICROSERVICE-A

**I DALJE, AKO BI AUTH MICROSERVICE WENT-OVAO DOWN SOME DAY, BIO BI U VELIKOM PROBLEMU, JER SVE STO ZAVISI OD AUTH-A E BI FUNKCIONISALO**

# 2. FUNDAMENTAL OPTION: INDIVIDUAL SERVICES ZNAJU KAKO DA AUTHENTICATE-UJU USER-A

OVO ZNACI DA SE U SVAKOM OD MICROSERVICE-A, KOJI TREBAJU AUTHENICATION, USTVARI IMPLEMENTIRA AUTHENTICATION LOGIKA

DAKLE TEACH-UJE SE SVAKI INDIVIDUAL MICROSERVICE, HOW TO DECIDE IF USER IS AUTHENTICATED

DAKLE OVO JE DOBRO JER AUTHENTICATION LOGIC NIJE EXCLUSIVE THING ZA SAMO JEDAN MICROSERVICE, I NEMAM ONU BOJAZAN: "STA AKO CRASHUJE AUTH MICROSERVICE"

**MOZES DA ZAMISLIS DA JE DOWNSIDE, USTVARI DUPLICATION CODA ZA AUTHENTICATION, KOJI CE SADA MORATI IMATI SVAKI OD MICROSERVICE-A, KOJEM JE AUTHENTICATION LOGIKA POTREBNA**

ALI TO NECE BITI PROBLEM, JER CU NAPRAVITI SHARED LIBRARI, KOJI MOGU KORISTITI SVI MICROSERVICE-I

# JASNO TI JE DA CU KORISTITI OPTION NO 2; ALI I ON IMA HUGE ISSUES, O KOJIMA MORAM GOVORITI

DAKLE TVOJ DATABASE KOJI SI KREIRAO I U KOJI STORE-UJES USERS VEZAN JE ZA `auth` MICROSERVICE

**TVOJI DRUGI MICROSERVICE-I CE IMATI DRUGACIJE DATBASE-OVE, SA DRUGIM KOLEKCIJAMA (OVO JE JAKO BITNO), ONI NECE STORE-OVATI USERE**

RECIMO DA IMAS USERA ZA KOJEG JE UTVRDJENO DA JE MALICIOUS, NA PRIMER ON JE OTPUSTEN IZ TVOJE KOMPANIJE, ILI JE USER KOJI JE POKUSAO DA URADI NESTO LOSE

**TI BI ZA TAKAV USER ACCOUNT IMAO, NA PRIMER POLJE `banned: true` ILI `hasAccess: false` U DOKUMENTU U Users KOLEKCIJI U DATABASE-U**

**DAKLE IMAJ NA UMU DA TI JE DATBASE GDE SU TI USERI SAMO VEZAN ZA `auth` MICROSERVICE**

TAJ MALICIOZNI KOISNIK JE IMAO IZDAT VALID JWT ILI COOKIE ILI NESTO SLICNO, PRE NEGO STO JE BIO BANNED, **I TAJ COOKIE ILI JWT JE STILL INSIDE HIS BROWSER, JER TI NEMAS NIKAKVE MOCI DA DIRAS TAJ BROWSER, MALICIOUS USER-A**

*TAJ MALICIOUS USER, MOZE NA PRIMER DA NAPRAVI REQUEST DO NEKOG TVOG `orders` ILI `purchase` MICROSERVICE-A*

**S OBZIROM DA IMA TOKEN ILI COOKIE, TAJ SERVICE CE KORISTITI TU JWT ILI SESSION COOKIE AUTHENTICATION LOGIKU, KAKO BI PROVERIO DA LI JE TAJ KORISNIK AUTHETICATED**

**NARAVNO JWT ILI COOKIE LOGIKA, IZ BILO KOG DRUGOG SERVICE-AM, OSIM `auth` ONE, NEMA PRISTUP ONOM DATABASE-U USERA, GDE BI MOGLA PROVERITII DA LI JE TAJ USER BANNED ILI NIJE NA OSNOVU FIELDA- KOJI BI TO OPISIVAO**

**PROVERA BI ODLUCILA DA JE ON AUTHENTICATED, SAMO ZBOG TOGA JER JE IMAO VALIDNI TOKEN ILI COOKIE**

SHVATAS SADA U CEMU JE PROBLEM

# MEDJUTIM POSTOJI NACIN DA SE RESI GORNJI PROBLEM; IAKO GA JA NECU IMPLEMENTIRATI U MOJOJ APLIKACIJI, JER IZISKUJE OGROMAN POSAO

MEDJUTIM IPAK CU DA OBJASNIM, KOJE JE RESENJE

A ZNAO SAM GA I OD RANIJE, A TO JE DA JWT IMA SVOJ ROK TRAJANJA (STO SAM JA VEC, JEDANPUT IMPLEMENTIRAO U [DRUGOM WORKSHOP-U](https://github.com/Rade58/authentication/blob/master/src/utils/jwt.ts), KADA SAM KORISTIO `'jsonwebtoken'` PAKET, I MOZES VIDETI NA OSTAVLJENOM LIKU, KAKO SAM PODESAVAO I EXPIRATION)

