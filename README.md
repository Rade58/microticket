# common MODULE UPDATING

DAKLE TREBA DA KOPIRAM SVU OVU LOGIKU OKO PUBLISHINGA I LISTENINGA EVENTOVA, IZ `nats_test_project` U `common` MODUL, KOJI CEMO ONDA REBUILD-OVATI I REPUBLISHOVATI GA NA [NPM](https://www.npmjs.com/package/@ramicktick/common)

ZATIM MORAMO REINSTALIRATI, POMENUTI MODUL U tickets MICROSERVICE-U, KAKO BISMO MOGLI KORISTITI NATS STREAMING SERVER LOGIKU

- `mkdir common/src/events`

NECU SVE KOPIRATI

KOPIRO SAM ABSTRAKTNE KLASE, ZATIM ENUM KOJIM SE TYPE-UJU CHANNEL NAME, I INTERFACE, KOJIM SE KORISTI KAO GENERIC, KADA SE EXTEND-UJE ABTRACT CLASS

`nats_test_project/src/events/abstr-listener.ts`
`nats_test_project/src/events/abstr-publisher.ts`
`nats_test_project/src/events/channel-names.ts`
`nats_test_project/src/events/ticket-created-event.ts`

NISAM KOPIRAO KLASE, KOJE SU KORISTILE ABSTRAKTNU DA BI SE NAPRAVIO CUSTOM PUBLISHER I LISTENER CLASS

SADA DAKLE IMAM OVO U MOM common MODULU

`nats_test_project/src/abstr-listener.ts`
`nats_test_project/src/abstr-publisher.ts`
`nats_test_project/src/channel-names.ts`
`nats_test_project/src/ticket-created-event.ts`

