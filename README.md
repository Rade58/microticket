# IMPLEMENTING PUBLISHERS FOR `"order:created"` AND `"order:cancelled"`

**PRVO CEMO DA UPDATE-UJEMO NAS MODULE, KOJI SMO REPUBLISH-OVALI U PROSLOM BRANCH-U ,JER ON SADA IMA DVA NOVA INTERFACE-A ZA EVENTS**

- `cd orders`

- `yarn add @ramicktick/common --latest`

## PRAVIMO SADA FILE-OVE ZA PUBLISHERE

- `mkdir orders/src/events/publishers`

- `touch orders/src/events/publishers/order-created-publisher.ts`

- `touch orders/src/events/publishers/order-cancelled-publisher.ts`

# DEFINISACU PRVO CUSTOM PUBLISHER-A ZA `"order:created"`

- `code orders/src/events/publishers/order-created-publisher.ts`

```ts

```

# DEFINISACU I CUSTOM PUBLISHER-A ZA `"order:cancelled"`

- `code orders/src/events/publishers/order-created-publisher.ts`

```ts

```
