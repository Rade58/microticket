# SOLVING CONCURRENCY ISSUES

OVO JE ISTO EKSTENZIVNO, I ZATO NECU SVE ZAPISIVATI

POGLEDAJ VIDEO `14-18` KOJEG SAM OSTAVIO I NA GOOGLE CLOUD-U

GLAVNA STVAR:

**NECES SA NATS STREAMING SERVEROM DA RESAVAS CONCURRENCY ISSUES, JER ON ZA TO I NIJE NI DIZAJNIRAN; RESAVACES GA TAKO STO CES REDIZAJNIRATI TVOJE MICROSERVICE-E**

SAZETO OBJASNJENJE ZA FLOW:

1. IDEJA JE DA SE HIT-UJE TRANSACTION MICROSERVICE, KOJI IMA SVO DATBASE I STORE-UJE TRANSACTION DAJUCI JOJ REDNI BROJ

2. TRANSACTION SERVICE CE BITI ODGOVORAN DA POSALJE KAO EVENT NA NEKI KANAL, TAJ DATA KOJI CE U SEBI IMATI TAJ REDNI BROJ

3. NATS NARAVNO PROSLEDJUJE EVENT IZ TOG KANALA NA LISTENERE KOJI SU SUBSCRIBED

4. 1. IDELANO NECE DOCI DO NIKAKVOG LATENCY-JA, IL IDA NEC DOCI DO CRACHINGA NEKE KOPIJE TVOG MICROSERVICE-A, FOR SOME REASON

ODNOSNO NI JEDNA KOPIJA TVOG MICROSERVICE-A NECE BITI OMETENA, ISVE CE SE STORE-OVTI PO REDU

4. 2. U SLUCAJU DA CE DOCI DO LATENCY-JA, DA CE DOCI DO CRACHINGA KOPIJE TVOG MICROSERVICE-A

DA JEDNA KOPIJA MICROSERVICE-A, KOJI JE SUBSCRIBED NA EVENT USTVARI FAIL-UJE, A DA JE ISSUED POTPUNO NOVI EVENT, POSLE TOG KOJI NIJ MOGAO PROCI; I DA JE TAJ NOVI EVENT PROSAO, DESILO BI SE SLEDECE:

BIO BI PROVEREN BROJ TRANSAKCIJE KOJI BI BIO STORED U DATBASE-U ZA TAJ MICROSERVICE

**AKO TAJ BROJ NIJE ZA JEDAN VECI OD POSLEDNJEG BROJA TRANSAKCIJE**, MI NE BISKO AKNOWLEDGOVALI (`msg.ack()`), I OPET BI SE DESIO TAJ POKUSAJ NATS STREAMING SERVERA AFTER SOME TIME, PO KOJEM CE OPET NATS STREAMING SERVER NAKON NEKIH 30 SEKUNDI POKUSTATI SLANJE EVENT-A KOJI NIJE AKNOWLDGED, I TADA AKO JE MREZA OK, PROCI CE EVENT I OPET CE SE PROVERITI TRANSACTION NUMBER, KOJI CE MOZDA BITI IN RIGHT ORDERU I TAKO CE SE USPESNO STORE-OVATI, ONO STO JE TREBALO, DAKLE PO RIGHT ORDERU, I NAKON TOGA MOZE DA IZVRSI (`msg.ack()`)  

**DAKLE VAZNA STVAR JE `LAST TRASACTION NUMBER` KOJI BI BIO STORED U DATBASE-U MICROSERVICE-A LISTENER-A**

ALI UZMI SLUCAJ PO KOJEM NA PRIMER PROCESS-UJE DATA ZA DIFFERENT USERE

**E PA ONDA BI VEZA OTRANSACTION NUMBER ZA USER ID, KOJI BI BUIO STORED U DATBASE-U PORED TRANSACTION BROJA**

TAKO DA BI SE PROVERAVO TRANSACTION NUMBER ZA SPECIFIC USERA

NARAVNO TO NE MORA DA BIDE USER, TO MOGU BITI BABE I ZABE

**NA OVAJ NACIN MOZEMO PROCESS-OVATI DATA ZA JEDNU BABU KOD KOJE JE TRANSACTION NUMBER PO REDU, A ZA DRUGU BABU AKO NIJE U REDU, ONDA SE TO NE AKNOWLEDG-UJE, PA CE SAM NATS POKUSATI OPET NAKON 30 SEKUNDI**

DAKLE TO JE BILO, ILI TO SU BILA MOJA UPROSCENA OBAJSNJENJA
