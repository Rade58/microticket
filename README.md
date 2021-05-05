# U KOJIM KOLEKCIJAMA, U MICROSERVICE-OVIMA, TREBA DA SE PRIMENJUJE INCREMENTING `version` FIELD-A, KADA SE DOKUMENT UPDATE-UJE

OPET PRVO MORAS SAGLEDATI SITUACIJU PREKO ZAMISLJENOG PROBLEMA

JEDAN TVOJ MICROSERVICE, KOJI BI SE ZVAO `comments` MICROSERVICE, EMIT-UJE EVENT: `"comment:created"`, KOJI NA KRAJ USTIZE DO DVA DRUGA MICROSERVICE-A: `query` I `moderation`

1. `query` JE TAJ KOJI ISTO KAO I OSTALI MICROSERVICE-I PRAVI DATA REPLICATION, I KADA USER HOCE DA UZME DATA ON GA OPSLUZI

2. `moderation` SERVICE JESTE TAJ KOJI PROVERVA SAM KOMENTAR, DA LI IMA NESTO STO JE FORBIDDEN; I ON PRAVI DATA REPLICATION

***
***

ULOGA `query` MICROSERVICE-A

DATA JE AVAILABLE ODMAH KROZ query MICROSERVICE, JER CIM JE COMMENT CREATED, ON ZNA ZA TO JER JE DOBIO EVENT, ALI KOMENTAR JE POSLAT DO KORISNIKA CENZURISAN, JER SE NA KRAJU KRAJEVA CEKA MODERATION (**CEKA SE PROMENA STATUSA TOG KOMENTARA OD STRANE MODERATION MICROSERVICE-A**, A DO TADA JE PRIKAZAN NEKI TEKS KORISNIKU DA JE "*comment made, but is awaitong for moderation"*)

***
***

ULOGA `moderation` MICROSERVICE-A

ON OBAVLJA NEKI PROCESSING NA KOMENTARU DA VIDI DA LI JE KOMENTAR U REDU, ILI SA OVIM MICROSERVICE-OM RAZGOVARA ADMINISTRATOR, I KADA ON ODLUCI DA PROVERI KOMENTAR, I DA UPDATE-UJE NJEGOV STATUS, ON CE TO ODRADITI

***
***

**OBRTI PAZNJU DA JE `comments` MICROSERVICE, TAJ KOJI MORA SVE DA ZNA O PROMENI KOMENTARA, ODNOSNO UPDATING-U, JER ON JE MICROSERVICE, KOJI SE BAVI KOMENTARIMA, I ON MORA DA ZNA KADA JE KOMENTAR `CREATED/UPDATED/DESTROYED`**

ODNOSNO MORA DA ZNA KADA SE BILO STA DOGODI SA KOMENTAROM

A JEDAN OD TIH MODIFIKACIJA JE MODERATION KOMANTARA, ON MORA DA ZNA KADA JE COMMENT MODERATED

I NJEMU BI STIZAO EVENT `"comment:moderated"`

NAKON CEGA BI ON UPDATE-OVAO DATBASE DAJUCI NOVI STATUS KOMENTARU

DAKLE I TO JE NOVA PROMENA, I `comments` MICROSERVICE MORA DA OBZNANI DA JE COMMENT MODERATED, I DA SADA IMA PROMENJEN N PRIMER TAJ JEDAN `status` FIELD

ZATO `comments` ISSUE-UJE EVENT "`comment:updated`"

***
***

`"comment:updated"` STIZE EVENTUALLY DO `query` MICROSERVICE-A, GDE OVAJ U SVOM DATBASE-U OPET ODRADI DATA REPLICATION

I KADA KORISNIK OPET POSALJE REQUEST KA query MICROSERVICE-U, DOBICE DRUGACIJI DATA, NEGO STO JE DOBIO RANIJE KADA JE KOMENTAR KREIRAN, A JOS NIJE BIO MODERATED

# SADA U SVU OVU PRICU UVEDI I `version` ZA EVENT-OVE, I PRINCIP OPTIMISTIC CONCURRENCY CONTROLL-A; I ZAPASCES U PROBLEM

DESICE SE ERROR



