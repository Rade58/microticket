# SHOWING STRIPE PAYMENT FORM

VEC SAM RANIJE KORISTIO STRIPE NA FRONEND-U

EVO MOZES DA [POGLEDAS OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_SETTING_UP_STRIPE), [I OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_1_STRIPE_MULTIPLE_PRODUCTS_MULTIPLE_PRICES), [I OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_2_FETCHING_STRIPE_DATA)

ALI PROVEO BI DOSTA VREMENA POKUSAVAJUCI NESTO OVAKO, ZATO CU KORISTITI PAKET, KOJI KORISTI I AUTOR WORKSHOPA (**IAKO JE KAKO VIDIM, UNMAINTAINED FOR 4 YEARS**)

STVARI KOJE SAM RANIJE RADIO ZAHTEVAJU DEFINISANJE CELOG JEDNOG PAGE-A ZA STRIPE CHECKOUT (STO JE NARAVNO PRAVI NACIN DA SE IDE KADA SE KORISTI STRIPE, ALI TO JE TOO MUCH ZA MOJU APLIKACIJU)

ZATO CU KORISTITI PAKET KOJI KORISTI AUTOR WORKSHOPAS

## KORISTICEMO PAKET `react-stripe-checkout`; IAKO GA NIKAD NECU KORISTITI U PRODUCTION-U; CISTO ZELIM DA STO PRE ZAVRSIM WORKSHOP

DAKLE KADA BUDEM PRAVIO REAL WORLD APP, [KORISTIO BI NESTO OVAKO](https://stripe.com/docs/payments/integration-builder), A NE OVO STO CU SADA URADITI

- `cd client`

- `yarn add` [react-stripe-checkout](https://www.npmjs.com/package/react-stripe-checkout)

## TREBACE TI PUBLISHABLE STRIPE KEY, KOJI MOZES NACI U STRIPE DASBOARD-U

POSTO JE PUBLISHABLE MOZES GA HARDCODE-OVATI GDE HOCES

ALI NIJE NI TO DOBRA PARKASA

ZATO CU GA DODATI U .env.local FILE KOJI NE COMMIT-UJEM

- `touch client/.env.local`

```zsh
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

# MOZEMO KONACNO DA UPOTREBIMO PAKET KOJ ISMO INSTALIRALI

- `code client/pages/orders/[orderId].tsx`

```ts

```




