# tickets MICROSERVICE CONCURRENCY OVERVIEW

U PROSLOM BRANCH-U SAM SPOMENUO `LAST TRANSACTION` THING

TO CE RADIDTI SIMILARLY I INSIDE MOJE microticket APLIKACIJE

TACNIJE TO CU URADITI U MOM tickets MICROSERVICE-U

## SADACEMO VIZUUALIZOVITI IN OUR MINDS AN EXAMPLE OF HOW THIS IS GOING TO WORK

BOLJE JE DA POKAZEM OVAJ DIAGRAM, KOJIM JE UOPSTENO PRIKAZANO STA CEMO

![concurrency](images/concurrency.jpg)

DA KAZEM, DA U SLUCAJU MOG APP, DRUGI MICROSERVICE, KOJI POSEBNO BRINE O `price` FIELD-U RESURSA tickets MICROSERVICE, JESTE MICROSERVICE orders

orders MICROSERVICE CE MORATI ZNATI price OF EVRY TICKET, I MORACE ZNATI ZA UPDATING TOG PRICE-A

ZA tickets MICROSERVICE, SALJU SE REQUESTS, KOJIMA SE KRIRA ILI UPDATE-UJE TICKET (NA NJIH SADA OBRCAM PAZNJU, A POSTOJE A MOGUCE JE I CITATI SPECIFIC TICKET BY ID ILI GETT-OVATI ALL TICKET, MEDJUTIM MENE SADA ZNAIM CRETION I UPDATING)

D IMAGINE-UJEM STA SE DESAVA KADA SALJEM TE REQUESTS ZA CRETION, I ZA UPDATING

**NA PRIMER SEND-OVAO SAM REQUEST KOJI KREIRA TICKET SA price-OM 10$**

TO CE MICROSERVICE tickets PROCESS-OVATI I STORE-OVATI TICKET DOKUMENT U DATBASE-U

FIELD-OVI KOJI ME TRENUTNO ZANIMAJU IZMEDJU OSTALIH FIELD-OVA TICET DOKUMENTA SU: `ticket id` `price` `version`

**`version` CE BITI NESTO POPUT ONOG STO SAM U PROSLOM BRANCH-U NAZVAO `last transaction`**
