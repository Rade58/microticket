# RECI CU TI NEKOLIKO STVARI O TOME U KOM SMERU CE SADA ICI NASA CLIENT SIDE APPLIKACIJA

NAIME RECI CU TI KOJE CU SVE STRANICE IMATI:

***
***

**PRVE TRI SAM VEC NAPRAVIO**

1. `/auth/signin` `/pages/auth/signin.tsx` 

2. `/auth/signup` `/pages/auth/signup.tsx` 

3. `/auth/signout` `/pages/auth/signout.tsx` 

REKAO SAM TI RANIJE DA U NORMALNOM APP-U TI BI OPTIONALY RENDER-OVAO signin signup signout KOMPONENT, A NE BI IMAO PAGE-OVE; JA IMAM PAGE-OVE SAMO DA BRZE ZAVRSIM

***
***

**LANDING PAGE CU KORIGOVATI DA PRIKAZUJE LIST OF TICKETS, ZA CURRENT SIGNED IN USER-A**

4. `/` `/pages/index.tsx` 

***
***

**A OVO SU POTPUNO NOVI PAGE-OVI KOJE TREBAM NAPRAVITI**

***
***

**PAGE ZA KREIRANJE TICKETA**

5. `/tickets/new` `/pages/tickets/new.tsx`

***
***

**PAGE SPECIFIC TICKETA**

6. `/tickets/:ticketId` `/pages/tickets/[ticketId].tsx` 

NA PAGE-U CE BITI `Charge` BUTTON SA KOJI MSE INICIRA PRAVLJENJE ORDERA, ZA TICKET

***
***

**PAGE ORDERA**

7. `/orders/:orderId` `/pages/orders/[orderId].tsx` 

NA NJEMU CE SE NALAZITI `Pay` BUTTON, KOJI CE ONDA OTVORITI MODAL NAPRAVLJEN SA `@stripe/stripe-js` LIBRARY-JEM

TU CE MOCI DA SE IZVSI UNOS CREDIT CARD INFO-A; **CIME BI TREBALO DA SE PROIZVEDE `token` KOJI KORISTI NAS BACKEND ENDPOINT `/api/payments/new`** 

***
***

