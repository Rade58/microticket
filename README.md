# COOKIES AND ENCRYPTION

DAKLE U PROSLOM BRANCH-U SAM REKAO KAKO CE TECI AUTHENTICATION U SLUCAJU SIGNUP-A, ODNOSNO ONDA KADA KORISNIK NAPRAVI ACCOUNT, ODNOSNO KADA PRVI PUT, REQUESTOM HITT-UJE `/api/users/signup` ROUTE

1. KORISNIK SALJE POMENUTI REQUEST, KOJI NA SEBI IMA `{email, password}`

- PROVERAVA SE DA LI EMAIL VEC POSTOJI, AKO POSTOJI RESPOND-OVACE SE SA ERROR MESSAGE-OM (NARAVNO ERROR MIDDLEWARE JE ODGOVORAN ZA SLANJE REQUEST-A (SAMO TI NAPOMINJEM AKO SI ZABORAVIO))

- AKO NIJE POSTOJAO TAKAV USER USER, STORE-UJEMO GA, ALI HASH-UJEMO PASSWORD PRILIKOM STORINGA U DATABASE-U I Users KOLEKCIJI 

- USER JE SADA CONSIDERED TO BE LOGGED IN

2. **I MI MU SALJEMO JWT, DO CLIENT-A INSIDE A COOKIE; ODNOSNO SALJEMO JWT AS A `Set-Cookie` HEADER**

# SADA CU TI POKAZATI STA CEMO KORISTITI ZA MANAGING COOKIE-A, I TAJ LIBRARY CU KORISTITI ACROSS ALL DIFFERENT SERVICES, KAKO BI SMO MOGLI DA READ-UJEMO DATA IZ COOKIE-A

LIBRARY SE ZOVE ['cookie-session'](https://www.npmjs.com/package/cookie-session)

PAKET KO PAKET OMOGUCAVA STORING A LOT OF INFORMATIONS INSIDE A COOKIE ITSELF; TI PROCITAJ [DOCSE](https://github.com/expressjs/cookie-session#readme) ZA OSTALI INFO 

OVO JE DOBRO RESENJE JER SE NE RELY-UJE ON BACKING DATA STORE, STO JE U MOM SLUCAJU REQUIREMENT MOJE ARHITEKTURE DA MI SE AUTH MECHANISM NE RELY-UJE ON BACKING DATA STORE

# REKAO SAM DA JE REQUIREMENT ZA MOJ AUTH MECHANISM DA ON BUDE LAKO RAZUMLJIV IZMEDJU RAZLICITIH LANGUAGE-OVA; E PA TO MOZE BITI CHALLENGING IU SLUCAJU COOKIE-A

OVO JE ZATO STO JE OFTEN TIME, CONTENT OF THE COOKIE USTVARI ENCRYPTED

`cookie-session` SUPPORT-UJE ENCRYPTION, I JA MOGU KORISTITI OVJ PAKET DA ENCRYPT-UJEM CONTENT OF THE COOKIE

TO NAS MOZE UVUCI U PROBLEME JER OVAJ PAKET SIGURNO SUPPORT-UJE NEKI ENCRYPTION ALGORITHM, KOJI MOZDA NE POSTOJU U RUBY-JU ILI U PYTHON-U, I JA BIH GA MORAO PRONACI I INSTALIRATI

# DAKLE MI SE MORAMO UVERITI DA JE CONTENT OF THE COOKIE EASYLY UNDERSTOOD BY DIFFERENT LANGUAGES

JA ZATO NECU ENCYPTOVATI DATA OF THE COOKIE, JER JE NJEGOV CONTENT, A TO CE BITI JSON WEB TOKEN, USTVARI TAMPER RESISTANT

**U TEORIJI JE NE ENCRYPTYING COOKIE-A SECURITY ISSUE, JER MALICIOUS KORISNIK ONDA MOZE CITATI CONTENT COOKIE-A**

**ALI KAO STO REKOH TO NIJE A BIG DEAL FOR US, JER KORISTIMO JWT KOJI VEC IMA SVOJU ENKRIPCIJU**

ODNOSNO AKO MALICIOUS KORISNIK POKUSA DA MODIFICIRA JWT, ON CE BITI INVALID KADA SE PARSE-UJE

DAKLE INFORMACIJA STORED U JWT SE NE MOZE MODIFIKOVATI I MENJATI I TO JE NAJBITNIJE

**OVO TI MOZE IZGLEDATI KAO BIG DEAL**

ALI TI IONAKO NECES STORE-OVATI PROTECTED INFO U JSON WEB TOKENU, NECES NA PRIMETR KORISTITI PASSWOD KORISNIKA, INSIDE PAYLOAD, KADA BUDS BUILD-OVAO JWT

**ALI AKO TI JE VAZNO TI GA MOZES ENCRYPT-OVATI, ALI SI ONDA U RIZIKU, KADA PRAVIS MICROSERVICE, KOJI KORISTI DIFFERENT LANGUAGE, JER CES TADA IMATI PROBLEM DA DECRYPT-UJES COOKIE**

JA GA NECU ENCRYPTOVATI, SAMO DA ZNAS
