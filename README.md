# BIG NOTES ON NATS STREAMING

ZA RAZLIKU OD CUSTOM RESENJA U KOJEM SAM IMAO EVENT BUS KOJI JE BIO EXPRESS UP KOJI RECEIVE-UJE I EMMIT-UJE EVENTS, **NATS STREAMING SERVER UOPSTE NIJE TAKAV**

KORISTICU CLIENT LIBRARY, KOJI SE ZOVE **`node-nats-streaming`**

<https://www.npmjs.com/package/node-nats-streaming>

TESKO JE SHVATITI KAKO OVO FUNKCIONISE NA PRVI POGLED

ZATO CU MORATI ODRADITI JEDAN STAND ALONE PROJECT KAKO BI SHVATIO KAKO SVE OVO FUNKCIONISE

OVAJ LIBRARY JE CALLBACK BASED, TAK ODA NECES KORISTI async await SINTAKSU

**node-nats-streamin CU KORITITI I ZA SLANJE EVENT-OVA DO NATS SERVER-A I TAKODJE CU GA KORISTITI ZA ANTICIPATION EVENT-OVA FROM NATS**

KADA SAM RANIJE PRAVIO EVENT BUS-A KOJI JE BIO EXPRESS APP, ON JE EMMIT-OVAO EVENTS TO EVERY SINGLE MICROSERVICE, PA CAK I ONAJ MICROSERVICE, KOJI JE INICIJALNO POSLAO EVENT, DOBIO BI ECHOED BACK ISTI TAJ EVENT FROM THE MICROSERVICE

**U SLUCAJU NATS STREAMING-A, DOBIJACE EVENT SAMO ONO SERVICE-OVI SUBSCRIBED TO SPECIFI CHANNELS**

TO CE BITI CHANELLS OF EVENTS ZA KOJE SE DEFINISE SUBSCRIPTION

ZA CHAANELLS CE SE KORITITI I TERMIN TOPICS

## MOZES DA POSMATRAS OVAKO

KANALI SU KCREATED NA NATS SERVERU

KANALI SU U OVAKVOM FORMATU: `ticket:created`, `ticket:updated`

tickets MICROSERVICE, UZ POMOC POMENUTOG node-nats-streaming LIBRARY-JA BI REKAO PUBLISH THIS DATA TO THE `ticket:updated` CHANNEL

ONDA BI NATS STREAMING SERVER, POSALO "Ticket Updated Event" DO MICROSERVICE-A, KOJI SU SUBSCRIBED NA KANAL `ticket:updated`

ONA MICROSERVICE, KOJI NE LISTEN-UJE NA TAJ CHANNAL NE BI DOBIO NISTA

## NAS SIMPLE EVENT BUS, KOJI JE BIO EXPRESS SERVER, JE STORE-OVAO EVENTS IN MEMORY, UPOREDO SA NJIHOVIM ECHOINGOM

TO SMO RADILI U [OBICNOM ARRAY-U](https://github.com/Rade58/first_taste_of_microservices/tree/4_5_STORING_EVENTS_WHEN_THEY_HIT_EVENT_BUS)

I TO JE TADA BILO VAZNO JER KADA BI NEKI MICROSERVICE BIO DOWN, INICIJALONO PO POKRETANJU BI SLAO EVENT, KAKO BI DOBIO SVE EVENT-OVE (U SAMOM CALLBACK-U KOJI SE IZVRSAVA KADA SE POCNE LISTENING EXPRESS SERVERA, FETCH-OVAL ISU SE SVI TI EVENT-OVI ODJEDNOM)

DAKLE OVO JE BILO CRITICAL ZA TO KADA JE NEKI MICROSERVICE DOWN PA SE RESTARTUJE DA ODMAH KONZUMIRA SVE TE ZAOSTALE EVENT-OVE, I CRITICAL KADA SE NOVI MICROSERVICE SERVICE DODAJE NASEM APP-U 

## NATS STREAMING SERVER IMA SIMILAR IDEA ABOUT STORING EVENTS,ALI JE WAY MOR COMPLX AND ROBUST

PO DEFAULTU ON CE STORE-OVATI SVE EVENT-OVE IN MEMORY

**ALI MOZEMO TO CUSTOMIZE-OVATI DA STORE-UJEMO TE EVENT-OVE U FLAT FILE-OVIMA STORED ON THE HARD DRIVE, ILI U MySQL/Postgress DB-OVIMA**

## ZA SVE OSTALE INFORMACIJE KOJE SAM MOZDA PROPUSTIO, POGLEDAJ 14-04 VIDEO
