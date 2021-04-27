# HANDLING PUBLISH FAILIRE

U PREDHODNOM BRANCH-U SAM TI PREDSTAVIO PROBLEM KOJI MOZE BITI PROUZROKOVN KADA SE NE BI NISTA RADILO ON EVENT PUBLISHING FAILIRE

REKAO SAM TI I DA JE RESENJE USTVARI STORING EVENTA PRE NEJGOVOG PUBLISHING-A 

AKO IMAS NEKI `product` MICROSERVICE, I TAJ MICROSERVICE TAKODJE IMA DATABASE

I U TOM DATBASE-U SE CUVAJU SVI PRODUCTS; ODNOSNO U TOM DATBASE-U POSTOJI `Products` KOLEKCIJA

**ALI JOS VAZNIJE, U TOM DATNASE-U TREBA DA POSTOJI I `Event` KOLEKCIJA U KOJOJ CE STORE-OVATI EVENT**

`DAKLE SIMULTANO U ISTI DATABASE, RELATED TO MICROSERVICE, TI CES STORE-OVATI DATA, ALI CES STORE-OVATI I EVENT`

**NA STORED Event DOKUMENTU TRBA DA POSTOJI NEKI FLAG, KOJI CE RECI DA LI JE EVENT PUBLISHED ILI NIJE**

NA PRIMER KADA PRVI PUT STORE-UJES EVENT, DEFINISAO BI DA sent FIELD, ILI `sent` FLAG, DA BUDE `"NO"`)

## ALI MI BI IMALI SEPARATE PROCESS, SOME SEPARATE PICE OF CODE, SOMETHING OUTSIDE OF OUR ROUTE HANDLER, KOJI BI WATCH-OVAO EVENTS, ODNOSNO EVENTS KOLEKCIJU DATBASE-A

IT CAN TAKE NOTE ANY TIME WE SAVE EVENT TO THE DATBASE

**TAJ SEPARATE PIECE OF CODE BI EXTRACT-OVAO TAJ EVENT; ODNOSNO PULL-OVAO GA OUT FROM THAT COLLECTION, I PUBLISHOVAO BI GA TO NATS STREAMING SERVER**

**AKO JE PUBLISHING BIO SUCCESSFUL, ONDA MOZEMO DA UPDATE-UJEMO `sent` FLAG ZA EVENT DOCUMENT U DATBASE-U, KAKO BI ON SADA BIO `"YES"`**

`A AKO NATS BUDE DOWN ILI JE NASA CONNECKIJA SA NATSOM DOWN FOR SOME REASON ?`

E PA ONDA I DALJE Product DOKUMENT SAVE-UJEMO U Products KOLEKCIJU, ALI SAVE-UJEMO I Event U Events KOLEKCIJU

**ALI TAJ SEPARATE PIECE OF CODE ILI PROCESS ILI WHAT EVER ELSE, CE SE IZVRSITI, I KADA SE NATS KONEKCIJA OPET USPOSTAVI; TAJ PIECE OF CODE CE PULL-OVATII EVENT FROM DATABASE, PA CE GA POSALTI NATSU, A Event DOKUENT CE UPDATE-OVATI, DA MI FLAG `sent` BUDE `"YES"`**

PA PREVAZISAO BI SE PROBLEM PO KOJEM JE DATA SAVED U JEDNOM MICROSERVICE-U, A DRUGI MICROSERVICE NIJE DOBIO EVENT, JER NEMA KOMUNIKACIJE SA EVENT BUS-OM; **DAKLE U OVOM SLUCAJU SVI POKUSANI DA SE PUBLISH-UJU EVENT-OVI, A KOJI NISU USPELI DA BUDU PUBLISHED, BICE PULLED I REPUBLISHED KADA SE KONEKCIJA PONOVO USPOSTAVI**

# SITUACIJA PO KOJOJ FAIL-UJE STORING Event DOKUMENT U Events KOLEKCIJU U MICROSVICE-OVOM DATABASE-U

NA PRIMER UZROK MOE BITI NEKI DATBASE CONSTRAINT ILI NESTO SLICNO

DAKLE U SLUCAJU NASEG ZAMISLJENOG PRIMERA `products` MICROSERVICE, MI SE MORAMO POSTARATI DA KADA SAVE-UJEMO Product DOKUMANT U DATABASE, OBEZBEDIMO I SAVING Event-A U Events KOLEKCIJU ISTOG DATABASE-A

**`AKO SE EVENT NE SAVE-UJE`, MORAMO SE POSTARATI DA UKLONIMO IZ DATBASE-A, RELATED `Product` DOKUMMENT ,KOJ ISMO SAVE-OVALI**

DAKLE MORAMO DA UNDO-UJEMO SVE CHANGES KOJE SMO NAPRAVILI U DATBASE-U

AKO SUCCESSFULY SAVE-UJES Product DOKUMENT, ALI NE I EVENT, MORAS DA SE POSTARAS DA UKLONISTS TAJ ISTI Product DOKUMENT IZ DATABASE

**ISTO VAZI ZA TO DA AKO SI FAIL-OVAO DA NAPRAVIS Product DOKUMENT U DATBASE-U, A DA SI SAVE-OVAO USPENO Event**

**`TADA MORAS DA ROLL-UJES BACK I UKLONIS Event FROM THE DATBASE`**

## MNOGE DATBASES, UKLJUCUJUCI I MONGO IMAJU ALREADY BUILT IN LOGIKU ,KOJA SE ZOVE `DATABASE TRANSACTION` LOGIKA

`DATABASE TRANSACTION` DOZVOLJVA DA KAZES DA AKO APLICIRAS SET NEKIH CHANGES; I DA PRI TOME FAIL-UJE ODREDJENI CHANGE, DA SE NI JEDAN OD CHANGES PRI TOME NE IZVRSI

DAKLE AKO JEDAN FAIL-UJE TREBA DA FAIL-UJU I DRUGI

SET CHANGESA KOJI TI PRAVIS JE U SLUCAJU NASEG ZAMISLENOG PRIMERA USTVARI: `SAVING Product DOKUMENTA`, I `SAVING Event DOKUMENTA`

TAKO DA MOZEMO POSTICI DA AKO JEADAN OD SAVINGA FAIL-UJE, TAKODJE FAIL-UJE I DRUGI

**U CILJU USTEDE VREMENA, JA POMENUTO NECU IMPLEMENTIRATI U MOJOJ APLIKACIJI, IAKO SAM REKAO DA CU UCINITI A MOJ APP BUDE AS MORE PRODUCTION GRADE AS POSIBLE**

ALI MI OVDE CUTT-UJEMO CORNER I NECEMO TO IMPLEMENTIRTI, U CILU USTEDE VREMENA I JER IMA PREVISE KOMPLEKSNOSTI

TI TO MOZES URADITI U NEKOM OD SVOJIH PRODUCTION READY PROJEKATA

ALI MI I NECEMO IMATI TAKAV ISSUE U NASEM PROJEKT, PROSTO GA NECEMO ENCOUNTER-OVATI
