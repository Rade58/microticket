# EASY PUBLISH COMMAND

***
***

HAJDE DA SADA PRVO DEFINISEMO .gitignore


***
***

SADA CEMO SE POZABAVITI `"main"` FIELD-OM U package.json FILE-U

ON PO DEFAULTU IMA VREDNOST `"index.js"`

**TO ZNACI DA JE TAJ FILE, KOJI SE IMPORT-UJE, KADA SE ATTEMPT-UJE OVERALL MODULE**

U SLUCAJU MOG MODULE-A, TO NE ODGOVARA

U SLUCAJU MOG `common` LIBRARY-JA, ONO STO BI TREBAL ODA SE KORISTI JE ONO INSIDE `build` FOLDER

ODNOSNO JA IMAM index.js U BUILD DIRECTORY-JU

TAKO DA CU TO IZMENITI

- `code common/package.json`

```js
{
  "name": "@ramicktick/common",
  "version": "1.0.0",
  // UMESTO OVOGA
  // "main": "index.js",
  // OVO
  "main": "./build/index.js",
  // 
  "license": "MIT",
  "devDependencies": {
    "del-cli": "^3.0.1",
    "typescript": "^4.2.4"
  },
  "scripts": {
    "clean": "del ./build/*",
    "build": "npm run clean && tsc"
  }
}

```

## SADA CEMO DA SE POZABAVIMO I FIELDOM `"types"`, A TO KORISTI TYPESCRIPT, I GOVORI TYPESCRIPT GDE SE NALZI MAIN TYPE DEFINITIONS

ZA NAS TO JE FILE `common/build/index.d.ts`

- `code common/package.json`

```js
{
  "name": "@ramicktick/common",
  "version": "1.0.0",
  "main": "./build/index.js",
  // OVO SAM DODAO
  "types": "./build/index.d.ts",
  // 
  "license": "MIT",
  "devDependencies": {
    "del-cli": "^3.0.1",
    "typescript": "^4.2.4"
  },
  "scripts": {
    "clean": "del ./build/*",
    "build": "npm run clean && tsc"
  }
}
```

## ZADA CEMO DA DEFINISEMO `"files"` ARRAY, U KOJI CEMO DA SPECIFICIRAMO KOJE TO SET FILE-OVA U NASEM PROJEKTU, ZELIM ODA 100% BUDU INCLUDED U FINAL PUBLISHED VERSION OF OUR PACKAGE

ZA NAS TO JE SVE FROM INSIDE OF build DIRECTORY

- `code common/package.json`

```js
{
  "name": "@ramicktick/common",
  "version": "1.0.0",
  "main": "./build/index.js",
  "types": "./build/index.d.ts",
  // DODAO SAM OVO (NEMO JDA STAVLJAS ./ NA POCETKU)
  "files": [
    // DAKLE SVI FILE-OVI I FLDERI IZ build FOLDERA
    "build/**/*"
  ],
  // 
  "license": "MIT",
  "devDependencies": {
    "del-cli": "^3.0.1",
    "typescript": "^4.2.4"
  },
  "scripts": {
    "clean": "del ./build/*",
    "build": "npm run clean && tsc"
  }
}

```


