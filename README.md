# `Create Read Update Destroy` SERVER SETUP

JA CU SE U OVOJ SERIJI BRANCH-EVA, KOJI POCINJU SA 5_1, BAVITI CREATINGOM `ticketing` MICROSERVICE-A

**IMACU UKUPNO 4 HANDLER-A**

1. `"POST"` `/api/tickets` **`CREATE A TICKET`** body: `{title: string; price: string}`

2. `"GET"` `/api/tickets` **`RETREIVING ALL TICKETS`**

3. `"GET"` `/api/tickets/:id` **`RETRIEVE TICKET WITH SSPECIFIC ID`**

4. `"PUT"` `/api/tickets` **`UPDATE A TICKET`** body: `{title: string; price: string}`

KASNIJE CES SHVATITI ZASTO price ISTO TRBA DA BUDE string TYPE-A

**OVAJ `ticketing` MICROSERVICE, KOMUNICIRACE SA NOVIM DATBASE-OM, KOJI NARANO NECE IMATI NIKAKVE VEZE SA ONIM DATBASE-OM VEZANIM ZA auth MICROSERVICE**

DOKUMENT U DATBASE CE IMATI SLEDECE FIELD-OVE:

**`{userId, title, price}`**

