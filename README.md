# PROBLEM SA SERVER SIDE RENDERING-OM I DETERMINING-A DA LI JE USER AUTHENTICATED

***

NAIME KAD, U SLUCAJU USPESNOG SIGNUP-A REDIRECT-UJES SA `/auth/signup` PAGE-A DO INDEX PAGE-A (ODNOSNO DO LANDING PAGE-A), TREBALO BI DA SE **INDICIRA DA JE KORISNIK SIGNED IN, ODNOSNO DA JE AUTHENTICATED**

ODNOSNO AKO USER NJETE AUTHENICATED TREBALO BI DA NA INDEX PAGE-U PISE `You are signed in`, U SUPROTNOM TREBA DA PISE `You are not signed in`

**ISTO TAKO KADA USER ODE NA INDEX PAGE, FOR THE FIRST TIME, TAJ TEKST `You are not signed in` TREBA DA BUDE DISPLAYED**

DA JE U PITANJU NORMAL REACT APPLICATION, SIGURNO BI ON MOUNTING INDEX PAGE-A DEFINISAO DA SE NAPRAVI DODATNI REQUEST, KA `/api/users/current-user` NADAJUCI SE DA CE COOKIE, USTVARI BITI PROVIDED U TOM FOLLOW UP REQUEST-U

***

**ALI TI SADA KORISTIS NEXTJS APP, I KORISTIS SERVER SIDE RENDERING**

**TREBAS DEFINISATI HOOK, KOJIM CES MOCI DA DEFINISES CODE KOJI CE SE IZVRSITI SERVER SIDE NA DELU NEXTJS-OVOG SERVERA, JER MOGUCE JE DA TAKVO NESTO DEFINISES; TAKO CCES POSTICI DA USTVARI SERVER SIDE TI NA SVAKU POSETU INDEX PAGE-A NAPRAVIS REQUEST PREMA `/api/users/current-user` I TAKO DETERMINE-UJES DA LI JE USER AUTHENTICATED ILI NE**

# KORISTICES `getServerSideProps` HOOK NEXTJS-A

