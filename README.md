# HANDLING `"expiration:complete"` EVENT

DAKLE TREBA TI LISTENER U orders MICROSERVICE-U, KOJI CE SLUSATI NA POMENUTI EVENT, I KOJI CE UPDATE-OVATI ODREDJENI Order DOKUMENT, MENJAJUCU `status` FIELD TO BE `"cancelled"`

ISTO TAKO KAA CANCELL-UJEMO ORDER, ZELIM ODA PUBLISH-UJEMO I EVENT `"order:cancelled"`, PRVENSTVANO ZATO DA BI TAJ EVENT UHVATIO tickes MICROSERVICE, KAKO BI MOGAO DA "OTKLJUCA" ODREDJENI Ticket DOKUMENT DA SE SME EDIT-OVATI

## HAJDE DA KREIRAMO `ExpirationCompleteListener`-A U `orders` MICROSERVICE-U

MEDJUTIM PRE TOGA TAMO MORAMO UPDATE-OVATI @ramicktick/common LIBRARY, JER SMO JE MENJALI

- `cd orders`

- `yarn add @ramicktick/common --latest`

- `touch orders/src/events/listeners/expiration-complete-listener.ts`

```ts

```
