# BUILDING A TEST PROJECT THAT USES NATS STREAMING SERVER

ZASTO PRAVIM TEST PROJEKAT, PA DA BI ISPROBAO NATS STREAMING SERVER

ONO STA CU URADITI JSTE:

1. KREIATI NOVI SUBPROJECT SA TYPESCRIPT SUPPORTOM

2. INSTALIRACU `node-nats-streaming` LIBRARY, UZ POMOC KOJEG CU SE **CONNECT-OVATI NA NATS STREAMING SERVER**

3. DODACU DVA `npm` SCRIPT, JEDAN KOJI CE RUNN-OVATI CODE ZA EMMITING EVENT-OVA, DRUGI KOJI CE LISTEN-OVATI FOR EVENTS

DAKLE IMACEMO DVA SEPARATE PROGRMA

4. PROGRAME CEMO RUNN-OVATI OUTSIDE OF KUBERNETES; NECEMO KREIRATI DEPLOYMENT AND THINGS LIKE THAT

**ALI MI CEMO SE CONNECTOVATI NA ONAJ NAT STREAMING SERVER, KOJI VEC RUNN-UJE U KUBERNETES CLUSTER-U**; OVA KONEKCIJA CE BITI MALO CHALLENGING

# NAS SUBPROJECT CE BITI U `nats_test` FOLDERU

- `mkdir nats_test_project`

- `cd nats_test_project`

- `yarn init -y`

**PORED `node-nats-streaming` PAKETA INSTALIRACEMO I PAKETE KOJE CE NAM OMOGUCITI DA PROJECT RUNN-UJEMO SA TYPESCRIPTOM**

- `yarn add node-nats-streaming ts-node-dev typescript @types/node`

## KREIRCEMO DVA FILE-A, KOJ ICE IMATI IMENA: `src/publisher.ts` I `src/listener.ts`

- `mkdir nats_test_project/src`

- `touch nats_test_project/src/{publisher,listener}.ts`

ONI CE HOLD-OVATI ESENTIALLY DVA SEPARATE PROGRAMA KOJA CEMO DA PUT-UJEMO TOGETHER, EVENTUALLY

JEDAN CE BITI DEDICATED ZA LISTENING FOR EVENTS

DRUGI CE BITI DEDICATED TO PUBLISHING EVENTS

## PRE PISANJE BILO KKVOG CODE, NAPRAVICU SCRIPTS ZA RUNNING MENTIONED SEPARATE FILES

- `code nats_test_project/package.json`

```json
"scripts": {
  "publish": "ts-node-dev --notify false src/publisher.ts",
  "listen": "ts-node-dev --notify false src/listener.ts"
}
```

## NAPRAVICEMO I `tsconfig.json` FILE

- `cd nats_test_project`

- `npx tsc --init`

# POCECEMO SA `publisher.ts` FILE-OM

- `code nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";

// KREIRACEMO CLIENT, UZ PMOC KOJEG SE KONEKTUJEMO NA NATS STREAMING SERVER
// AND TO TRY TO EXCHNGE SOME INFO WITH IT

// AUTORI NATSA, VOLE OVO DA IMENUJU SA stan (NATS BCKWARDS)
// ALI ZNAJ DA JE OVO CLIENT
const stan = nats.connect("microticket", "abc", {
  // OBJASNICU KASNIJE STA OVI SETTINGS ZNACE
  url: "http://localhost:4222",
});

// NE MOGU DA KORISTIM async await SINTAKSU, JER JE OVAJ SISTEM EVENT BASE
// PRVO CEMO DA SLUSAMO NA connect EVENT, KOJI SE DOGADJA, NAKON USPESNOG
// KONEKTOVANJA

stan.on("connect", () => {
  // FUNKCIJA EXECUTED NAKON STO SE CLIENT (stan)
  // USPESNO CONNECT-UJE NA NATS STREAMING SERVER
  console.log("Publisher connected to NATS");
});

```

**AKO POKUSAMO OVO SADA DA RUNN-UJEMO DOBICEMO ERROR, KOJI CE RECI DA NE MOZEMO DA SE CONNECTUJEMO**

ZATO STO NAS NATS STREAMING SERVER NIJE AVAILABLE NA LOCALHOST-U 4222 NA NASOL LOKALNOJ MACHINE-I

SECAS SE, NAS NAT STREAMING SERVER JE DEPLOYED U CLUSTERU, INSIDE ITS OWN POD

MI NEMAMO DIRECT ACCESS DO TOGA

DAKLE MI CEMO MORATI DA ODRADIMO PORT FORWARDING

TI VEC MISLIS DA CEMO MOZDA KORITITI NODE PORT SERVICE ZA EXPOSING NATS STREEAMING SERVER-A, KOJI JE U CLUSTERU U NEKOM PODU

ILI MISLISA DA CEMO IPAAK KORISTITI CLUSTER IP SERVICE

E PA NECEMO NI JEDAN NI DRUGI

POKAZACU TI U SLEDECEM BRANCH-U, STA CEMO KORISTITI ZA PORT FORWARDING NATS STREAMING SERVERA
