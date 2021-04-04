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

# POSTO SAM TI REKAO DA CE PROBLEM BITI U SERVER SIDE RENDERING-U; HAJDE DA REVIEW-UJEMO KAKO NORMAL REACT APP USTVARI RADI

KADA BI IMAO REACT APP KOJI ZIVI NA `microticket.com`; KORISNIK BI UNEO `microticket.com` STO BI: 

1. REZULTOVALO **GET** REQUESTOM, POSLATIM KA POMENUTOJ ADRESI

RESPONSI BI KORISNIKU DONEO HTML FILE (KOJI JE BAREBONES; NEMA MNOGO U SEBI), KOJI BI PORED OSTALOG IMAO I `script` TAGOVE

BROWSER CE VIDETI ALL OF THOSE script TAGS; A ZBOG JAVASCRIPT CODE INSIDE, U KOJEM JE DEFINISAN NETWORK REQUEST (USTVARI MULTIPLE REQUESTS) KA DRUGIM JAVASCRIPT FILE-OVIMA; EXECUTE-OVACE SVE TE SCRIPT TAGOVOVE, 

2. CIME CE SLATI NETWORK REQUESTS (JEDAN ILI VISE)

ONO STO CE SE DOBITI U RESPONSE-OVIMA JESU RAZLICITI JAVASCRIPT FILE-OVI; A MOZDA I CSS FILE-OVI

BROWSER CE EXECUTE-OVATI CODE INSIDE THEM

TADA CE REACT APP BOOT-OVATI UP INSIDE THE BROWSER

***
***

A TEK SADA CE SE EXECUTE-OVATI ONI NETWORK REQUEST, KOJE SI TI LAY-OVAO DOWN INSIDE CODEBASE

3. RECIMO DA JE REQUEST POSLAT KA `orders` MICROSERVICE-U, ASLK-UJUCI FOR SOME DATA; I orders SERVICE BI RESPOND-OVAO WITH SOME DATA

REACT APPLICATION BI UZELA TAJ INFO I BUILD-OVALO SOME HTML I DISPLAY-OVAO TAJ DATA KAKO BI GA POKAZO KORISNIKU

***
***

DAKLE SVE OVO GORE JE BIO NORMAL FLOW NEKE REACT APLIKACIJE 

DAKLE, SVE U SVEMU, POSLATO JE DAKLE TRI REQUEST-A (ILI TRI TIPA REQUEST-A)
