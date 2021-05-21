# SOME TEMPORRAY FIXES, AND SOME OTHER FIXEES

MORAMO DA NAPRAVIMO NEKE IZMENE I U NASEM CODEBASE-U; ALI NEKE OD NJIH CE BITI, SAMO PRIVREMENE IZMENE, KOJE SE TICU SA JEDNE STRANE, PROBLEMA DA NISAM PROVIDE-OVAO SSL CERTIFICATE, I SA DRUGE STRANE, PROBLEMA DA SAM JA USTVARI RUNN-UJEM MOJE MICROSERVICE-OVE U DEVELOPMENT MODE-U UKLJUCUJUCI I NEXTJS client APP

HAJDE DA POCNEMO OD PACKAGE-A `cookie-session`

NAIME KORISTIMO `cookie-session` PACKAGE U CODEBASE-U `auth` MICROSERVICE-A (**USTVARI KORISTIMO GA U SVAKOD OD PAKETA KOJI KORISTE `ExpressJS`**), A DA SMO PODESILI DA POMENUTI PACKAGE CHECK-UJE DA LI JE U PITANJU TRANSFER COOKIE THROUGH HTTPS; I DA VALJD SETT-UJE `"Set-Cookie"` HEADER NA RESPONSE-U, SAMO ZA REQUESTS KOJI SU POSLATI OVER HTTPS

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


***
***
***
***
***
***

PODSETNIK:

SSL:
`cookie-session`

NGING URL:
`client/utils/buildApiClient.ts`

TAKODJE SAM PRIMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`


***

