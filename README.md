# FORMMATING JSON YOU SENT FROM YOUR MICROSERVICE

OPET NAPOMINJEM, ISTO KAO STO SAM DEFINISO ILI ISTRIVE-UJEM KA TOME DA ERROR MESSAGE/S BUDE/U CONSISTANT ACROSS ALL MICROSERVICES; **TREBALO BI DA SE STARAM I DA DATA INSIDE RESPONSE BUDE U FORMATU KOJI JE CONSISTANT ACROSS ALL MICROSERVICES**

POGOTOVO KADA IMAS NA PRIMER RAZLICITE MICROSERVICE-OVE, KOJI KORISTE RAZLLICITE DATABASE-OVE, TREBA DA SE STARAS DA KADA IZVUCES DATA IZ TIH DATABASE-OVA

**NA PRIMER KAD IZVUCES DATA IZ MONGODB-JA TEBI JE DATA U TAKVOM FORMATU DA IMAS PROPERTIJE `_id`, ZATIM `__v`**

TAKVE PROPERTIJE NEMAJU DRUGI DATABASE-OVI

**A TI TREBA DO CLIENTA DA, SVE SALJES U ISTOM FORMATU, JER TVOJ REACT, ODNOSNO NEXTJS APP TREBA DA ZANA SAMO ZA JEDAN FORMAT JSON-A, KOJI MU SALJU TVOJI MICROSERVICE-OVI SA RESPONSE-OVIMA**

ISTO TAKO KADA KREIRAS, ILI SAMO GET-UJES USER OBJEKAT, TI NE BI TREBAL ODA POSALJES U RESPONS-U CELOKUPAN OBJEKAT, VEC SAMO BASIC STUFF: `email` `id`

NARAVNO NE TREBAS DA SALJES PASSWORD BEZ OBZIRA STO JE PASSWORD HASHED





