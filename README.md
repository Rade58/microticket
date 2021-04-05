# GENEARATING A JWT

DAKLE U PROSLOM BRANCHU SAM HOOK-OVAO UP `cookie-session` MIDDLEWARE (STAMPAJ `auth/src/index.ts` PA VIDI KAKO SAM TO URADIO)

SADA PRE NEGO STO GENERISEM JWT, MORAM VIDETI KAKO SE SA `cookie-session` USTVARI STORE-UJE INFORMATION INSIDE A COOOKIE

EVO OVDE TI JE U [DOOKUMENTACIJI](https://github.com/expressjs/cookie-session#examples) POKAZANO KAKO SE TO RADI

```ts
// DAKLE OVO JE NEKI HANDLER
app.get('/', function (req, res, next) {
  
  // Update views
  req.session.views = (req.session.views || 0) + 1

  // Write response
  res.end(req.session.views + ' views')
})
```

**DAKLE KORISTI SE `req.session`**

TO CE BITI OBJEKAT, KOJI CE KREITARATI POMENUTI cookie-session MIDDLEWARE

**SVAKI INFO KOJI SE STORE-UJE NA `req.session` BICE automatski SERIALIZED BY cookie-session, I STORED INSIDE THE COOKIE**

**A JA CU STORE-OVATI JWT ON `req.session`**

# A JWT CU GENERISATI KORISCENJEM PAKETA `jsonwebtoken`

- `cd auth`

- `yarn add jsonwebtoken`

- `yarn add @types/jsonwebtoken --dev`

# SADA CU DA KORISTIM POMENUTI PAKET U MOM `/signup` HANDLERU

- `code auth/src/routes/signup.ts`

```ts

```
