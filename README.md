# ASSOCIATING Orders AND Tickets

***

digresija:

**MOZDA TI JE OVO SADA RANDOM INFORMACIJA, I NERLEVNTNA ZA TRENUTNU TEMU, `ALI OPET TE PODSECAM`, IDEJA DA KADA SE Ticket DOKUMENT KREIRA U `tickets` MICROSERVICE-U, EVENT CE BITI ISSUED, KOJI CE EVENTULLY STICI DO `orders` MICROSERVICE-A, I TAKO CE I U `orders` MICROSERVICE-U, ISTO TAKO STORE-OVATI DATA Ticket DOKUMENTA, ALI U DATBASE-U KOJI JE RELATED TO orders MICROSERVICE**

**A KADA KORISNIK BUDE PRAVIO ORDER, ONDA CE DATBASE, (RELATED TO ordrs MICROSERVICE) DOBITI Order DOKUMENT**

DAKLE DTABASE KOJI JE TIED TO orders CE IMATI DV KOLEKCIJE: Tickets I Orders

**A ONO STO ORDER IMA RELATED ticketId**

A QUERYING BI MI BIO OLAKSAN KADA BI TAJ ticketId BIO REFERENCA

***

ASSOCIATION JE MONGODB STVAR, [O KOJOJ SAM I OVDE GOVORIO](https://github.com/Rade58/apis_trying_out_and_practicing/tree/master/Node.js/2.%20MongoDB/c)%20ASSOCIATIONS)

OVDE TI GOVORIM O TOME DA JEDAN FIELD NA Orders DOKUMMENTU BUDE USTVARI REFERENCA ZA ODREDJENI Ticket DOKUMENT

TIME SAM SE VEC JEDNOM BAVIO

`ticketId` FIELD NA Orders DOKUMENTU TREBA DA BUDE TREFERENCA

# ZA TO MORAMO KORISTITI NESTED SCHEMAS

MI I NISMO DO SADA NI POCELI SA KREIRANJEM MONGOOSE MODELA ZA orders MICROSERVICE

TO CEMO SADA ODRADITI, A UZ TO CEMO DEFINISATI I NESTED SCHEMAS

# A PRI QUERYINGU REFERENCA SE MOZE QUERYOVATI, KORISCENJEM populate METODE

SAMO TI NAPOMINJEM
