# DISPLAYING TIMER ON ORDER PAGE

***
***

digresija:

IMAO SAM GRESKE KOJE SAM PRAVIO PRILIKOM NAVIGATING-A; I KORISCENJE data FROM `useRequestHook` MI JE LOSE, ZATO SAM IPAK POPRAVI MALO TAJ HOOK DA MI IPAK APPROPRIATE data DAJE `makeRequest`

ISTO TAKO NE KORISTIM VISE `as` NI U LINKOVIMA, A NI PRI KORISCENJU `push`

**USTVARI TO I NIJE BIO PROBLEM (IMAO SAM DRUGI PROBLEM (OBICAN TYPE-O))**

A SADA SE VRATI NA TEMU

***
***

DAKLE JA NA ORDER PAGE-U ZELIM DA PRIKAZEM TIMER, KOJI CE POKAZIVATI KORISNIKU, KOLIKO JOS MINUTA ILI SEKUNDI IMA DOK MU ORDER BNE EXPIRE-UJE; ODNPNO KOLIKO JOS IMA VREMENA DA PRISTISNE NA `Buy` DUGME, KOJE CE ISTO BITI DISPLAYED

IMAM NEKE IDEJE

KADA BUDE OVAVLJEN PROGRAMATICALLY NAVIGATION TO THE ORDER PAGE, ILI KADA SE RELOAD-UJE PAGE, TREBALO BI DA SE NAPRAVI REQUEST PREMA ENDPOINTU ZA GETTING SINGLE ORDERA (MOZE SERVER SIDE INSIDE getServerSideProps); A MEDJU PODACIMA BI TREBALO DA DOBIJES `expiresAt`; I PREMA TOME TI MOZES PODESAVATI TIMER

**KADA TIMER DODJE DO ZERO, SAKRICEMO I TIMER, A I `Pay` BUTTON**

- `code client/pages/orders/[orderId].tsx`

```tsx

```
