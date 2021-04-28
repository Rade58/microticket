# TESTS FOR ENSURING MOCK INVOCATION

U PROSLOM BRANCHU SI NAPRAVIO MOCK, KOJIM USPESNO MOCK-UJES, USTVARI, KORISCENJE INSTANCE KOJU EXPORT-UJES IZ OVOG FILE-A: `tickets/src/events/nats-wrapper.ts`

MEDJUTIM TI U TOM PROCESU SI MOCKOVAO SAM PUBLISHING EVENT-A

NIJE NISTA PUBLISHOVANO; ODNOSNO N IJEDAN EVENT NIJE PUBLISHED

JER TI SI HIGHJACK-OVAO NATS CLIENT-A, I USTVARI SI UMESTO TOGA KORISTIO NESTO STO SI SAM DEFINISAO

KAO STO VIDIS OVDE NEMA REAL NATS CLIENT-A, I NEMA REAL publish METODE

- `cat tickets/src/events/__mocks__/nats-wrapper.ts`

```ts
export const natsWrapper = {
  client: {
    publish(channelName: string, data: any, callback: () => void): void {

      callback();
    },
  },
};
```

A EVO KAKO IZGLEDA POZIVANJE TE FUNKCIJE; DAKLE SLEDECI CODE CE SE IZVRSITI PRILIKO TESTOVA, JER TI SLEDCEU FUNKCIJU POZIVAJ U HANDLERU KOJEG TESTIRAS 

- `cat common/src/events/abstr/abstr-publisher.ts`

```ts
// ...

publish(data: T["data"]) {
  const jsonData = JSON.stringify(data);

  // EVO GA UPOTREBA GORNJEG CLIENT ZA
  // KOJI SAM PISAO MOCK
  const stan = this.stanClient;
  // ---------------------------------

  const channelName = this.channelName;

  return new Promise<void>((res, rej) => {

    // ---- EVO OVDE IMAS POZIVANJE FUNKCIJE KOJI SI
    //                MOCKOVAO IZNAD          ----

    stan.publish(
      channelName,
      jsonData,
      /**
       *
       * @param error Error | undefined
       */
      (error) => {

        // EVO GA I CALLBACK CIJE SI TI POZIVANJE U MOCK-U
        // DEFINISAO

        // error TADA NISI NI PROSLEDIO
        // I OVO SE TADA NIJE ZAVRSILO
        if (error) {
          return rej(error);
        }

        // OVO JE ONO STO SE STAMPALO U TEST SUITE-U
        console.log(`
          Event Published
          Channel: ${this.channelName}
        `);

        // I OVAJ CLOSURE OVDE SE IZVRSIO
        // KAKO BI RESOLVE-OVAO PROMISE
        res();
      }
    );

  // ---------------------------------------


  });
}


// ...
```

ALI GDE JE U SVEMU TOME REAL NATS CLIENT

**PA NEMA GA, JER SI I ZELEO DA GA NE BUDE TOKOM TESTOVA**

**`ALI KAKO ONDA TESTIRATI ACTUAL PUBLISHING EVENT-OVA ????`**

AKO HOCU DA SE STVARNO UVERIM DA LI SE PUBLISH-UJE EVENT DO NATS STREAMING SERVER-A; MORAM SE UVERITI DA LI SE `STVARNO EXECUTE-UJE client.publish FUNKCIJA`

KADA SE TA FUNKCIJA POZIVA TO ZNACI 100% DA MI POKUSAVAMO DA POSALJEMO EVENT

ALI TI NE MORAS KORISTITI FAKE IMPLEMENTATION, KAKAV SI TI DEFINISAO, MOZES KORISTITI NESTO STO SE ZOVE MOCK FUNCTION

# MOCK FUNCTION (`jest.fn`)

MOCK FUNCTION JESTE ESSENTIALLY A FAKE FUNKCIJA, ALI DOZVOLJAVA DAA PODESAVAM EXPECTATIONS AROUND IT

ODNOSNO DOZVOLJAVA MI DA PRAVIM ASSERTIONS

N PRIMER MOGU PRAVITI EXPECTATION DA LI CE SE FUNKCIJE EXECUTOVATI, ILI PRAVITI EXPECTATIO NSA KOJIM CE SE ARGUMENTIMA IZVRSITI



