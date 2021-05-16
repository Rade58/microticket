# ORDER CREATION ON INDIVUDUAL TICKET PAGE

DA PRVO NAPRAVIM INTERFACE ZA DATA, KOJI MOZE DOCI KADA HIT-UJES ENDPOINT ZA KREIRANJE ORDER-A

- `touch `

```ts
export interface OrderataI {
  id: string;
  userId: string;
  status: string;
  expiresAt: string;
  ticket: string;
  version: number;
}

```

DA SE SDA POZABAVIM, KREIRANJEM ORDERA NA PAGE-U INDIVIDUAL TICKET-A

- `code client/pages/tickets/[ticketId].tsx`

SAMO DA TE PODSETIM DA ZA KREIRANJE ORDERA, SAMO TREBA ID TICKET-A

```tsx

```
