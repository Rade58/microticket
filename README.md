# tickets MICROSERVICE CONCURRENCY OVERVIEW

U PROSLOM BRANCH-U SAM SPOMENUO `LAST TRANSACTION` THING

TO CE RADIDTI SIMILARLY I INSIDE MOJE microticket APLIKACIJE

TACNIJE TO CU URADITI U MOM tickets MICROSERVICE-U

# SADA CEMO VIZUUALIZOVITI IN OUR MINDS AN EXAMPLE OF HOW THIS IS GOING TO WORK

BOLJE JE DA POKAZEM OVAJ DIAGRAM, KOJIM JE UOPSTENO PRIKAZANO STA CEMO

![concurrency](images/concurrency.jpg)

DA KAZEM, DA U SLUCAJU MOG APP, DRUGI MICROSERVICE, KOJI POSEBNO BRINE O `price` FIELD-U RESURSA tickets MICROSERVICE, JESTE MICROSERVICE orders

orders MICROSERVICE CE MORATI ZNATI price OF EVRY TICKET, I MORACE ZNATI ZA UPDATING TOG price-A

ZA tickets MICROSERVICE, SALJU SE REQUESTS, KOJIMA SE KRIRA ILI UPDATE-UJE TICKET (NA NJIH SADA OBRCAM PAZNJU, A POSTOJE A MOGUCE JE I CITATI SPECIFIC TICKET BY ID ILI GETT-OVATI ALL TICKET, MEDJUTIM MENE SADA ZNAIM CRETION I UPDATING)

D IMAGINE-UJEM STA SE DESAVA KADA SALJEM TE REQUESTS ZA CRETION, I ZA UPDATING

**NA PRIMER SEND-OVAO SAM REQUEST KOJI KREIRA TICKET SA price-OM 10$**

TO CE MICROSERVICE tickets PROCESS-OVATI I STORE-OVATI TICKET DOKUMENT U DATBASE-U

FIELD-OVI KOJI ME TRENUTNO ZANIMAJU IZMEDJU OSTALIH FIELD-OVA TICET DOKUMENTA SU: ticket `id`, `price`, `version`

**`version` CE BITI NESTO POPUT ONOG STO SAM U PROSLOM BRANCH-U NAZVAO `last transaction`**

ZADALI SMO `1` ZA `version` TOG KREIRANOG TICKET DOKUMENTA

**SADA tickets MICROSERVICE PUBLISH-UJE EVENT DO NATS STREAMING SERVER-A**

EVENT CE SE SLATI NA KANAL "`ticket:created`"; A PORED TOGA CE IMATI DATA: `{id, price: 10, version: 1}`

NATS CE TO PROSLEDITI ONOM MICROSERVICE-U KOJI JE SUBSCRIBED NA POMENUTI KANAL

TO CE BITI JEDINO `orders` MICROSERVICE, KOJI MOZE BITI SCALED HORIZONTALI, TAKO DA IMAS DVE INSTANCE TOG MICROSERVICE-A

**ALI ZAMISLI DA JE, CAK I PRE TOGA NEGO STO JE `ticket` MICROSERVICE, EMITOVAO TAJ EVENT, TAKODJE DOBIO JOS NEKOLIKO REQUEST-OVA**

RECIMO DA JE USER INSTANTNO KRENUO DA PRAVI DVA ADDITIONAL REQUESTA, JEDAN PA DRUGI NARAVNO, ALI DA JE ZELEO DA PROMENI PRICE TOG TICKETA

NA PRIMER HTEO JE DA POVECA PRICE NA 50, I POSLAO TAJ REQUEST

I REKAO JE ZASTO DA NE I 100, PA JE POSLAO I TA JREQUEST

***

ticket MICROSERVICE CE CE PROCESS-OVATI CHANGE, PROMENICE price TO 50, ALI TREBA DA SE PROMENI I `version` FIELD; **ODNOSNO `version` TREBA DA BUDE INCREMENTED ZA 1, TAKO DA CE BITI 1 + 1 = 2**

I KADA SE TO URADI SALJE SE OPET EVENT ALI ZA `"ticket:updated"` CHANNEL, I TAJ EVENT CE IMATI DATA: `{id, price: 50, version: 2}`

ALI REKLI SMO DA SMO POSLALI I DRUGI REQUEST

ticket MICROSERVICE CE CE PROCESS-OVATI CHANGE, PROMENICE price TO 100, ALI TREBA DA SE PROMENI I `version` FIELD; **ODNOSNO `version` TREBA DA BUDE INCREMENTED ZA 1, TAKO DA CE BITI 2 + 1 = 3**

I KADA SE TO URADI SALJE SE OPET EVENT ALI ZA `"ticket:updated"` CHANNEL, I TAJ EVENT CE IMATI DATA: `{id, price: 100, version: 3}`

***

## ZAMISLI SADA DA SE TA TRI EVENT-A, PRVO ZBOG BRZINE KOJOM SU IZASLI IZ tickets MICROSERVICE-A, A UZIMAJUCI U OBZIR I LATENCY, USTVARI ECHOED OD STRANE NATS STREAMING SERVER-A, VEOMA BRZO DO `orders` MICROSERVICE-A, KOJI JE LISTENER

S OBZIROM DA SMO REKLI DA ORDERS MICROSERVICE JESTE SCALED DUPLO HORIZONTALI I DA IMA DVE INSTANCE (NAZOVIMO IH `INSTANCA A` I `INSTANCA B`)

RECIMO DA JE INSTANCA A PRIMILA PRVI REQUEST, A DA JE ODMAH I INSTANCA B PRIMILA DRUGI EVENT

**I RECIMO DA JE PRVI EVENT FAILED, STO ZNACI DA CE NATS STREAMING SERVER OSTO NIJE DOBIO AKNOWLEDGEMENT (msg.ack()), POKUSATI OPET DA POSALJE TAJ EVENT NKON 30 SEKUNDI; NAKON CEG TREBA DA BUDE POSLAT OPET DO INSTANCE A ILI INSTANCE B orders MICROSERVICE-A**

INSATCA B JE USPESNO PRIMILA ONAJ DRUGI REQUEST, AL ITO JE REQUEST KOJI JE STIGAA OSA KANAL "`ticket:updated`" I U SEBI IMA DATA, SA SPECIFICIRANIM VERSIONOM KOJI JE VECI OD 1, ODNOSNO `version` JE 2

**AT THIS POINT TI NEAS NISTA U DATBASEU `orders` MICROSERVICE-A, NEMA NISTA ABOUT THE TICKET, CIJI DATA SALJES**

TI BI NARAVNO U `orders` MICROSERVICE-U NAPRAVIO USLOV, PO KAOJEM AKO TI SE DESI OVAKAVA SITUACIJA DA TI NE POZOVES `msg.ack()` ODNONO DA NE AKNOWLEDG-UJES EVENT, MODA MOZES I DA THROW-UJES ERROR FOR THE LOGGING PURPOSS, I PROSTO NE AKNOWLEDG-UJES TAJ EVENT

**DAKLE OPET POSTO NEMA AKNOWLEDGMENTA, I TAJ EVENT CE SE RESEN-OVATI OD STRANE NATS STREAMING SERVERA, NAKON 30 SEKUNDI**

***

RECIMO DA JE PROSLO 30 SEKUNDI I DA JE ONAJ PRVI EVENT OPET POSLAT, DO NA PRIMER INSTANCE B orders MICROSERVICE-A

SAD BI TREBAL ODA SVE BUDE U REDU, ODNOSNO SADA CE orders MICROSERVICE PROCESS-OVATI TAJ EVENT, VIDECE INSIDE DATA POSLATIM SA EVENTOM, DA U NJEMU IMA `version`: `1`

I DATBASE RELATED TO orders MICROSERVICE DOBICE OVAKAV UNOS {id, price: 10, version: 1}

IT IS AKNOWLEDGED I MOZE SE GORGET-OVATI DA SE TAJ EVENT IKADA DESIO

***

JOS OSTAJE DA SE PROCESS-UJU SECOND I THIRD EVENT, A KAO STO ZNAS ZA SVAKI OD NJIH TREBA DA PRODJE 30 SEKUNDI PRE NEGO STO SE RESEN-DUJU BACK TO orders

RECIMO DA JE JE DRUGI OTISAO DO INSTANCE A, A DA JE TRECI OTISAO DO INSTANCE B

**RECIMO DA SE OPET DESI PROBLEM PRI PROCESSINGU DRUGOG, I OPET CE SE TO TIME OUT-OVATI ZA 3O SEKUNDI, ODNOSNO POSTO NEMA AKNOWLEDMNTA NATS CE OPET POKUSATI SA SLANJEM**

A TRECI EVENT MOZE BITI PPROCESSED

SADA BI TI IMAO CODEE U orders MICROSERVICE-U KOJI UZIIMA BY id ONAJ DOKUMENT KOJI VEC POSTOJI, I PROVERAVA VERZIJU

IZVADJEN JE DOKUMENT SA `version:1`, A UPOREDJUJEM TAJ VERSION SA ONIM STO JE STIGLO KAO DATA, ALI TO JE `version: 3`

TTAK ODA SE OPET MOZE THROW-OVATI ERROR FOR THE LOGGING PURPOSES, A OPET POSTO SE ZBOG TOGA NECE POZVATI `msg.ack()`, OPET NAKON 30 SEKUNDI ISTI EVENT CE POSLATI NATS STREAMING SERVER DO NEKE INSTANCE orders-A

***

**PROSLO JE 30 SEKUNDI I OPET JE POSAT ONAJ DRUGI EVENT**

SADA CE SE VERZIJE SLAGATI I NE MORAM DA TI SIRIM VISE PRICU, SVE JE JASNO

# DAKLE ONO STO JE POTREBNO URADITI JESTE DODATI version FLAG, ZA SVAKI CANONICAL SERVICE, KOJI MANAGE-UJE ANY RESOURCE

## AKO TI MANGING VERZIJE IGLEDA JAKO NAPORNO, MONGO ODNOSNO MONGOOSE IMA BUILT IN THING ZA MANGING VERSIONA

OVU CELU DISKUSIJU SAM VISE PRATIO ZBOG RAZUMEVANJA
