# `Create Read Update Destroy` SERVER SETUP

JA CU SE U OVOJ SERIJI BRANCH-EVA, KOJI POCINJU SA 5_1, BAVITI CREATINGOM `ticketing` MICROSERVICE-A

IMACU UKUPNO 4 HANDLER-A

1. `"POST"` `/api/tickets` **`CREATE A TICKET`**

2. `"GET"` `/api/tickets` **`RETREIVING ALL TICKETS`** body: `{title: string; price: string}`

3. `"GET"` `/api/tickets/:id` **`RETRIEVE TICKET WITH SSPECIFIC ID`**

4. `"PUT"` `/api/tickets` **`UPDATE A TICKET`** body: `{title: string; price: string}`
