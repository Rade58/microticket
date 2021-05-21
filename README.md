# SOME TEMPORRAY FIXES, AND SOME OTHER FIXEES; AND WHERE TO GO NEXT

MORAMO DA NAPRAVIMO NEKE IZMENE I U NASEM CODEBASE-U; ALI NEKE OD NJIH CE BITI, SAMO PRIVREMENE IZMENE, KOJE SE TICU SA JEDNE STRANE, PROBLEMA DA NISAM PROVIDE-OVAO SSL CERTIFICATE, I SA DRUGE STRANE, PROBLEMA DA SAM JA USTVARI RUNN-UJEM MOJE MICROSERVICE-OVE U DEVELOPMENT MODE-U UKLJUCUJUCI I NEXTJS client APP

HAJDE DA POCNEMO OD PACKAGE-A `cookie-session`

NAIME KORISTIMO `cookie-session` PACKAGE U CODEBASE-U `auth` MICROSERVICE-A (**USTVARI KORISTIMO GA U SVAKOM OD PAKETA KOJI KORISTE `ExpressJS`**), A DA SMO PODESILI DA POMENUTI PACKAGE CHECK-UJE DA LI JE U PITANJU TRANSFER COOKIE THROUGH HTTPS; I DA VALJD SETT-UJE `"Set-Cookie"` HEADER NA RESPONSE-U, SAMO ZA REQUESTS KOJI SU POSLATI OVER HTTPS

TO CU DA POPRAVIM, TAKO STO CU DA COMMENT-UJEM OUT JEDAN LINE OF CODE U SVIM MICROSERVICE-OVIMA, KOJI KORISTE ExpressJS:

- `code {auth,orders,payments,tickets}/src/app.ts`

```ts
// ...
// ...

app.use(
  cookieSession({
    signed: false,
    // EVO OVO CEMO UMESTO OVOGA
    // secure: process.env.NODE_ENV !== "test",
    // PROSTO PODESITI DA BUDE `false`
    secure: false
  })
);

// ...
// ...
```
U SUSTINI ISPALO JE DA JE OVO JEDINI FIX ZA SADA

# A NAPRAVICU SADA JEDAN PODSETNIK U POGLEDU STA BIH JOS MORAO DA RESIM; ODNONO WHERE TO GO NEXT

1. ENABLING, ODNOSNO UPOTREBA SSL CERTIFICATE-A; ODNONO SLANJE REQUESTA PREKO HTTPS:

PORED TOGA STO JE MORE SECURE, TAKODJE CU MOCI PONOVO DA ENABLE-UJEM PROVERU DA SE COOKIE, UZ POMOC `cookie-session` PACKAGE-A, SETUJE SAMO ZA SLUCAJ, AKO JE REQUEST DOSAO PUTEM HTTPS-A

<https://cert-manager.io/> JE DOBRO MESTO DA SE (**OPEN SOURCE LIBRARY, KOJI CINI VEOMA LAKIM DA SE DODA HTTPS ZA KUBERNETES CLUSTER, KOJI KORISTI INGRESS NGINX**) (DOKUMENTACIJA JE A LITTLE BIT CHALLENGING TO GET THROUGH ,ALI AT THE END OF THE DAY IT IS STRAIGHT FORWARD PROCESS, KAKAV JE HTTPS GENERALNO)

2. DODAVANJE build STEPA ZA NASE MICROSERVICE-OVE

ODNOSNO NEKAKO **DA DEFINISEM DA JA, NA NASEM PRODUCTION CLUSTER-U, NA DIGITAL OCEAN-U, USTVARI RUNNUJEM MOJE MICROSERVICE-E U `PRODUCTION` MODE-U**, JER TRENUTNO, JA I DALLJE RUNN-UJEM MOJE EXPRESSJS MICROSERVICE-E AGAINST `ts-node-dev`; A MOJU NEXT APPLIKACIJ URUNN-UJEM AGAINST `next dev` (DAKLE TRENUTNO JE SVE U DEVELOPMENT MODE-U)

RECIMO MICROSERVICE-OVE BI TREBAO DA BUILD-UJES PA DA IH POKRENES AGAINS `node` EXECUTABLE

ZA NEXT, VEC IMAS RESENJE

**TREBAO BI DODATI ADDITIONAL `Dockerfile`-OVE, GDE BI JA DEFINISAO DA SE RUNN-UJU PRODUCTION SCRIPTS**

OVIM BI TI DRASTICNO POVECAO SPEED SVOJE APLIKACIJE

3. MOGAO BI DA DODAS JOS MICROSERVICE-A, **MOZDA DA SE DODA EMAIL SUPPORT KORISCENJEM: Mailchimp/Sendgrid I SIMILAR STVARI (THIRD PARTY EMAIL PROVIDER)**

NA PRIMER TAJ NOVI MICROSERVICE MOZE SLUSATI NA EVENT FOR PAYING TO THE ORDER, I ONDA SLATI MAIL U ODNOSU NA TO

4. KREIRANJE STAGING CLUSTER-A

OVO JE ZA LJUDE KOJI RADE NA MICROSERVICES PROJEKTIMA I KOJI RADE SA TIMOM

NASI TEAMMATE-OVI MOGU DA ZELE DA TESTIRAJU NAS APP MANUALLY BEFORE WE DEPLOY IT; TADA BI DODAO NOVI GITHUB WORKFLOW KOJI BI WATCH-OVALI PUSHES DO NEKOG DRUGOG BRANCH-A, KOJI BI KREIRALI, I KOJI BI SE MOZDA ZVAO `staging` **I U SUSTINI KREIRAO BI NOVI CLUSTER, NA KOJI BI DEPLOY-OVAO KADA BI PUSH-OVALI TO `staging` BRANCH**


***
***
***
***
***
***
***
***
***
***

PODSETNIK ZA GASENJE DELETING CLUSTER, ALI I DELETING LOAD BALANCER-A

baseUrl:
`client/utils/buildApiClient.ts`

TAKODJE SAM PRIMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`


***

