# COOKIES AND ENCRYPTION

DAKLE U PROSLOM BRANCH-U SAM REKAO KAKO CE TECI AUTHENTICATION U SLUCAJU SIGNUP-A, ODNOSNO ONDA KADA KORISNIK NAPRAVI ACCOUNT, ODNOSNO KADA PRVI PUT, REQUESTOM HITT-UJE `/api/users/signup` ROUTE

1. KORISNIK SALJE POMENUTI REQUEST, KOJI NA SEBI IMA `{email, password}`

- PROVERAVA SE DA LI EMAIL VEC POSTOJI, AKO POSTOJI RESPOND-OVACE SE SA ERROR MESSAGE-OM (NARAVNO ERROR MIDDLEWARE JE ODGOVORAN ZA SLANJE REQUEST-A (SAMO TI NAPOMINJEM AKO SI ZABORAVIO))

- AKO NIJE POSTOJAO TAKAV USER USER, STORE-UJEMO GA, ALI HASH-UJEMO PASSWORD PRILIKOM STORINGA U DATABASE-U I Users KOLEKCIJI 

- USER JE SADA CONSIDERED TO BE LOGGED IN

2. **I MI MU SALJEMO JWT, DO CLIENT-A INSIDE A COOKIE; ODNOSNO SALJEMO JWT AS A `Set-Cookie` HEADER**

# SDA CU TI POKAZATI STA CEMO KORISTITI ZA MANAGING COOKIE-A, I TAJ LIBRARY CU KORISTITI ACROSS ALL DIFFERENT SERVICES, KAKO BI SMO MOGLI DA READ-UJEMO DATA IZ COOKIE-A

LIBRARY SE ZOVE ['cookie-session'](https://www.npmjs.com/package/cookie-session)
