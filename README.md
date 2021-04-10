# BUILDING AUTH HELPER FUNCTION

DEFINISACU HELPER FUNKCIJU

DEFINISACU DA SE COOKIE TEST LOGIKA MOZE REUSE-OVATI, ODNOSNO DA NAPRAVIM JEDNU FUNKCIJU, KOJA CE SE SASTOJATI OD SUPERTEST SIGNUP REQUESTA, OBTAINING-A COOKIE-A SA TOG REQUEST-A, ZATIM PROVIDE-OVANJA COOKIE-E TO THE FOLLOWUP REQUEST

**TO CU URADITI JER CU U BUDUCNOSTI POMENUTO KORISTITI KADA BUDEM TESTIRAO DRUGE MICROSERVICE-OVE**

**JER TI MOZES IMATI MICROSERVICE KOJI CE ZAHTEAVTI DA KORISNIK BUDE SIGNED IN, I TI NECES MOCI TESTIRATI USPESNO RTAJ MICROSERVICE, A DA NISI OBEZBEDIO TO COOKIE LOGIKU, JER UNUTAR COOKIE JA JE {jwt} (JSON WEB TOKEN)**

# JA CU OVU FUNKCIJU NAPRAVITI KAO GLOBALNU FUNKCIJU, KAKO BI SE ONA MOGLA EASY KORISTITI FROM ANY TEST FILE; ME OVA FUNKCIJA NECE BITI AVAILABLE ACROSS YOUR APPLICATION CODE, VEC SAMO U TEST ENVIROMENTU

**NE MORA SE DEFINISATI GLOABALNA FUNKCIJA, ALI LAKSE JE TAKO DA SE U TESTOVIMA NE MORA DODAVATI REPETATIVE IMPORT STATEMENT ZA TOM FUNKCIJOM**

DAKLE TI SI MOGAO TU HELPER FUNKCIJU EXPORTOVATI IZ FOLDER-A: `auth/src/test`, I TAKO JE KORISTITI ALI JA TO NECU URADITI, JER NEMAM MNOGO PRILIKA ZA DEFINISANJEM GLOBALNE FUNKCIJE

TAKO DA CU SADA DEFINISATI GLOBALNU FUNKCIJU U `auth/src/test/setup.ts` FILE-U

- `code auth/src/test/setup.ts`

```ts
// REAKO SAM TI ZATO STO OVU FUNKCIJU DEFINISES OVDE, KAO GLOBAL,
// ONA CE BITI JEDINO AVAILABLE U TEST ENVIROMENT-U

// PRE DEFINISANJA FUNKCIJE DA BI PRAVILNO TYPE-OVAO
// GLOBALNU FUNKCIJU, JEDINO SAM MOGAO DA TYPE-UJEM OVAKO
declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      // FINKCIJA CE DA RETURN-UJE PROMISE
      // COOKIE-JEM (VREDNOSCU COOKIE-A JA ARRAY)
      // TAKO SAM TO I TYPE-OVAO
      makeRequestAndTakeCookie(): Promise<{
        cookie: string[];
      }>;
    }
  }
}

// DEFINISEM TU METODU
global.makeRequestAndTakeCookie = async () => {
  const email = "stavros@stavy.com";
  const password = "SuperCoolPerson66";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password }) // NE TREBA TI EXPECTATION
    // JER NIJE U FOKUSU (OVO SE OCEKUJE DA UVEK PRODJE)
    // ALI JA SAM GA IPAK STAVIO
    .expect(201);

  // UZIMAMO COOKIE
  const cookie = response.get("Set-Cookie");

  // console.log({ cookie });

  // MI SADA MOEMO RETURN-OVATI COOKIE

  return { cookie };
};
```

## MOZEMO SAD GORNJU FUNKCIJU IMPLEMENTIRATI U TESTOVIMA

- `code auth/src/routes/__test__/current-user.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  // UMESTO OVOGA

  /* const signUpResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const setCookieHeader = signUpResponse.get("Set-Cookie");

  */
  // UPOTREBLJAVAM GLOBALNU FUNKCIJU

  const { cookie } = await global.makeRequestAndTakeCookie();

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  console.log(response.body);
});
```
