# STRIPE SETUP

***

digrsija: (ALI VAZNA)

TI SI SE VEC JEDNOM BAVIO SA STRIPE-OM:

1) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_SETTING_UP_STRIPE#setting-up-stripe-a-n-connecting-stripe-to-gatsby)

2) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_1_STRIPE_MULTIPLE_PRODUCTS_MULTIPLE_PRICES#dakle-u-proslom-branchu-sam-podesio-stripe-i-uspesno-implementirao-checkout-a-sada-cu-sagledati-jos-nekoliko-stvari-koje-su-easy-sa-stripe-om)

3) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_2_FETCHING_STRIPE_DATA#fetching-stripe-data)

MEDJUTIM MISLIM DA JA NECU KORISTITI STRIPE, KAKO SAM GA KORISTIO NA GORNJIM LINKOVIMA

DA SE SADA VRATIM NA TEMU

***

IMAMO SOME CODE IN PLACE INSIDE CREATE CHARGE HANDLERA, ALI NISMO NISTA DEFINISALI U POGLEDU STRIPE-A

**MI MORAMO DEFINISATI CODE ZA ACCEPTING PAYMENTA, KOJI USER ZELI DA PROVIDE-UJE ZA ORDER**

U HANDLERU NAM JEDOSTUPAN `TOKEN FROM STRIPE`; ALI PORED TOKEN JA POTREBAN I `STRIPE API KEY`, KOJ ICE DA IDENTIFIIKUJE OUR APPLICATION TO THE STRIPE API

**SA TIM TOKENOM, MI RECH-UJEMO OUT TO STRIPE API, I ACTUALLY CHARGE USERS CREDIT CARD**

# PRVO PRAVIMO NOVI STRIPE ORGANIZATION

NE ZNAM DA LI MORA ALI JA CU TO URADITI

NAZVAO SAM JE `Microticket`

# SADA DA INSTALIRAMO MODUL `stripe`, KOJI PREDSTAVLJA NODEjs STRIPR LIBRARY ,ILI KAKO GA AUTOR WORKSHOPA ZOVE: NODEjs STRIPE SDK

[EVO OVO JE NPM PACKAGE](https://www.npmjs.com/package/stripe)

MISLIM DA MI NECMO KORISTI [@stripe/stipe-js](https://www.npmjs.com/package/@stripe/stripe-js)([github](https://github.com/stripe/stripe-js))

TAKO JE OVOG PUTA KORISTIMO LIBRARY

- `cd payments`

- `yarn add stripe`

# SADA MOZMO UZETI TEST API KEYS

JEDAN JE SECRET, A DRUGI JE PUBLISHABLE

MOZES IH NACI I LEVO NA `Developers` --> `API keys`

## DALJE KAKO CEMO DA KORISTIMO OVE KEYS POKAZACU TI U SLEDECEM BRANCH-U
