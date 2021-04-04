# DECIDING ON JWT TRANSPORT MECHANISM

***
***

**MOZDA TI TO NIJE EVIDENTNO, ALI AKO IMAS SERVER SIDE RENDERING APP, KAO STO JE NextJS APP, KOJI CU JA KORISTITI KAO MOJ FRONTEND, BICE TI VEOMA VAZNO KOJI CES TRANSPORT MECHANISM ZA JWT IZABRATI**

***
***

DAKLE U PROSLOM BRANCH-U SAM ODLUCIO DA CU KORISTITI JWT

ALI SADA MORAM ODLUCITI O TRANSPORT MECHANISM-U

***
***

[RANIJE SAM TI REKAO KOJE IMAS OPCIJE TRANSPORT MECHANISM-A ZA JWT](https://github.com/Rade58/microticket/tree/2_AUTHENTICATION_STRATEGIES_n_OPTIONS#jwt) (DAKLE GOVORIM O TRANSPORTU OD CLIENT-A KA SERVER-U):

1. >> CLIENT BI POSLAO TOKEN KAO VREDNOST Authorization HEADERA, ALI BI BREDNOST BILA U FORMATU: Bearer ${Your Token}, STO SAM JA RADIO U NEKIM RANIJIM PROJEKTIMA

2. >> MOZEMO SLATI TOKEN U BODY-JU REQUESTA; TO NARVNO MORA BITI POST, PUT AND SO ON

3. >> I MOZEMO SLATI TOKEN KAO VREDNOST Cookie HEADER-A, CIME BI COOKIE BIO MANAGED BU THE BROWSER I BIO BI SENT BY ANY FOLLOW UP REQUEST

***
***

# POSTO SAM TI REKAO DA CE PROBLEM BITI U SERVER SIDE RENDERING-U; HAJDE DA REVIEW-UJEMO KAKO NORMAL REACT APP USTVARI RADI, U POGLEDU EXECUTING-A REQUEST-OVA ZA SOURCE CODE-OM, I EXECUTINGA OSTALI HRQUEST-OVA FROM YOUR CODEBASE

KADA BI IMAO REACT APP KOJI ZIVI NA `microticket.com`; KORISNIK BI UNEO `microticket.com` STO BI: 

1. REZULTOVALO **GET** REQUESTOM, POSLATIM KA POMENUTOJ ADRESI

RESPONSI BI KORISNIKU DONEO HTML FILE (KOJI JE BAREBONES; NEMA MNOGO U SEBI), KOJI BI PORED OSTALOG IMAO I `script` TAGOVE

BROWSER CE VIDETI ALL OF THOSE script TAGS; A ZBOG JAVASCRIPT CODE INSIDE, U KOJEM JE DEFINISAN NETWORK REQUEST (USTVARI MULTIPLE REQUESTS) KA DRUGIM JAVASCRIPT FILE-OVIMA; EXECUTE-OVACE SVE TE SCRIPT TAGOVOVE

**DA NE BUDE ZABUNE, GOVORIM O SCRIPT TGOVIMA, KOJI IMAJU `src` ATRIBUT NA SEBI, CIME JE OZNACENO DA SE SALJU NETWORK REQUESTS KAKO BI SE UZELI JAVASCRIPT FILE-OVE**

2. SLACE SE DAKLE NETWORK REQUESTS KAKO BI BILI OBTINED JAVASCRIPT FILES

ONO STO CE SE DOBITI U RESPONSE-OVIMA JESU RAZLICITI JAVASCRIPT FILE-OVI; A MOZDA I CSS FILE-OVI

BROWSER CE EXECUTE-OVATI CODE INSIDE JAVASCRIPT FILES

TADA CE REACT APP BOOT-OVATI UP INSIDE THE BROWSER

***
***

A TEK SADA SE MOGU EXECUTE-OVATI ONI NETWORK REQUEST, KOJE SI TI LAY-OVAO DOWN INSIDE CODEBASE

3. RECIMO DA JE REQUEST POSLAT KA `orders` MICROSERVICE-U, ASLK-UJUCI FOR SOME DATA; I orders SERVICE BI RESPOND-OVAO WITH SOME DATA

REACT APPLICATION BI UZELA TAJ INFO I BUILD-OVALO SOME HTML I DISPLAY-OVAO TAJ DATA KAKO BI GA POKAZO KORISNIKU

***
***

DAKLE SVE OVO GORE JE BIO NORMAL FLOW NEKE REACT APLIKACIJE 

DAKLE, SVE U SVEMU, POSLATO JE DAKLE TRI REQUEST-A (ILI TRI TIPA REQUEST-A)

**STO SE TICE AUTHENTICATION-A NIJE UPOSTE DAKLE BITNO DA LI JE KORISNIK LOGGED IN KADA SE IZVRSAVAJU ONI INITIAL REQUEST KAKO BI SE OBTAIN-OVALI JAVASCRIPT I CSS FILE-OVI**

DAKLE TO SU FILE-OVI KOJI PREDSTAVLJAJU TVOJ SOURCE CODE

DA LI TREB DA SECUREJES SOURCE CODE?

NE, TO SE NIKADA NE RADI U PRODUCTION WORLD; BAR NIJE UOPSTE COMMON

**DAKLE KADA SE GETT-UJU INITIAL CSS I JAVASCRIPT ZA REACT APP, MENI UOPSTE NIJE BITNO DA LI JE KORISNIK LOGGED IN ILI NIJE**

**JEDINO ME ZANIMA DA LI JE USER AUTHENTIATED, KADA SALJE REQUESTS KA MICCROSERVICE-OVIMA, BAR KA ONIM KOJI ZAHTEVAJU DA KORISNIK BUDE AUTHENTICATED** ,`JER TADA KORISNIK IS ASKING FOR DATA`

REKAO SAM DA POSTOJE TRI TRANSPORT MECHANISM-A ZA JSON WEB TOKEN

I STO SE TICE NORMAL REACT APLIKACIJE, NIJE BITNO KOJI CES OD NACINA IZABRATI

# ALI JA NE ZELIM DA GRADIM NORMAL REACT APPLICATION, VEC ZELIM SERVER SIDE RENDERING; I BOG TOGA CU KORISTITI NextJS; MEDJUTIM ZBOG TOGA CE BITI BITNO, KOJI CU OD TRI TRANSPORTNA MEHANIZMA IZABRATI ZA JWT

ZASTO TO?

**PA ZATO STO CE SE ON INITIAL `"GET"` REQUESTM PREMA `microticket.com` DOWNLOAD-OVATI HTML STRING, KOJI CE U SEBI IMATI SAV EMBEDED DATA**

DKLE DOBICES FULLY RENDERED HTML FILE SA CONTENT-OM

ONO STO CE SE DESAVATI SERVER SIDE JESTE DA CE NEXTJS SERVER PRAVITI REQUEST PREMA MICROSERVICE-OVIMA, DOBIJAJUCI DATA I STAVLJATI GA U HTML STRING

I ONDA TAJ FULLY POPULATED HTML STRING DOLAZI DO BROWSER-A U RESPONSE-U, I BIVA ONDA LOADED VEOMA BRZO, I INSTANTN OCE TO SVE

NAMA FOLLOWUP REQUEST-OVA A GETTING JAVASCRIPT ILI CSS FILE-OVA

OVAJ SSR PRINCIP JA CU KORISTITI ZBOG SEO PURPOSES I ZBOG PAGE LOAD SPEED-A

**OVO ZNACI DA SE AUTHENTICATION INFO MORA ZANATI PO, POMENUTOM PRVOM REQUEST-U**

TAJ REQUEST MORA DA SADRZI JSON WEB TOKEN

# SSR PRESENT-UJE VERY BIG ISSUE

PA ZATO STO NEMA SANSE DA SE PRVI PUT POSALJE TAJ TOKEN KAO `Authorization` HEADER, JER NEMA NISAT OD JAVASCRIPT CODE INITIALLY STO BI UZELO TAJ TOKKEN I POSLALO BA KAO Authorization HEADER VALUE

ISTO TAKO NEMA SANSE DA SE REQUEST POSLAJE INSIDE BODY; ZATO STO OPET KAZEM TI, INITIALLY, NEMA JAVASCRIPTA KOJI BI UMETNUO TAJ TOKEN U BODY I POSLAO REQUEST

**ZATIO JE JEDINI NACINA DA SE JWT TOKEN SALJE KAO `Cookie` HEADER**

DAKLE COOKIE JE THE ONLY WY WE CAN COMMUNICATE INFORMATION FRO MTHE BROWSER TO THAT BACKEND DURING THE INITIAL PAGE LOAD

***

AKO SE SECAS POSTOJI NACIN DA SE SPIN-UJE SERVICE WORKER

DA TO JE VALIDAN NACIN ALI TO JE PREVISE OTSIDE THE SCOPE

JA BI TU MORAO DA INTERCEPT-UJEM INITIAL REQUEST SA SERVICE WORKEROM

ALI KAO STO REKOH TO JE OUT OF TH SCOPE I MORAO BI DA ARHITEKTURNO MENJA NAS APP

***
