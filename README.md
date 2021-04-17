# EASY PUBLISH COMMAND

***
***

digresija:

HAJDE DA SADA PRVO DEFINISEMO `.gitignore`
FOLDERI KOJE GITIGNORE-UJES SU `node_modules` ,A TAKODJE I `build` FOLDER (**DAKLE TRANSPILED JAVASCRIPT I TYPE DEFINISTIONS FILE SE NE COMMIT-UJU I NE PUBLISH-UJU**)

- `touch common/.gitignore`

```gitignore
node_modules
build
```

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

# SADA CEMO DA NAPRAVIMO CHANGE U NASEM LIBRARY-JU, SAGRADICE CODE (TRANSPILE-OVACEMO TYPESCRIPT INTO JAVSCRIPT SA TYPE DEFINITIONSIMA) I ONDA CEMO TO DA PUBLISH-UJEMO TO NPM

- `code common/src/index.ts`

SAMO CEMO NESTO EXPORT-OVATI IZ FILE-A

```ts
interface Color {
  red: number;
  blue: number;
  green: number;
}

const color: Color = {
  blue: 18,
  green: 18,
  red: 18,
};

console.log({ color });

// DODAO SAM OVO
export default color;
```

# SADA CEMO DA COMMIT-UJEMO CHANGES

- `cd common`

- `git status`

- `git add -A`

- `git commit -am "feat(index.ts) exporting colors"`

**UVEK TREBAS DA COMMIT-UJES CHANGES**

# SADA MOZEMO DA PROMENIMO VERZIJU; ODNOSNO DA INCREMENT-UJEMO VERSION

TO MOZEMO URADITI MANUELNO MENJAJUCI *"version"* FIELD U `package.json`

ALI MOZES KORISTITI SOME NPM BUILT IN COMMANDS

MOZES DA RUNN-UJES

- `cd common`

- `npm version patch`

TO CE POVECATI ONAJ LAST NUMBER VREDNOSTI *"version"*-A

TO JE MENI BUMPOVALU VERSION FROM 1.0.0 DO 1.0.1

**TI UVEK MORAS INCREMENT-OVATI VERSION OF THE PACKE, PRE NEGO STO GA PUBLISH-UJES**

AKO TE ZANIMA VSE INFORMACIJA O VERSIONINGU PROCITAJ VISE O [SEMATIC VERSIONING-U](https://docs.npmjs.com/about-semantic-versioning/)

## SADA PONOVO POKRECEMO BUILD COMMAND

- `cd common`

- `npm run build`

## SADA CEMO DA PUBLISH-UJEMO

- `cd common`

- `npm publish`

OPET MOZES DA ODES DO SVOG PAKETA NA NPM SITE-U DA VIDIS DA LI JE PUBLISHED

ONO STO TI MOZE BITI INTERESANTNO JESTE DA CE PORED IMENA PAKETA STAJATI PLAVA IKONICA `ts`, STO ZNACI DA JE PREPOZNATO TO STO SAM OBEZBEDIO TYPE DEFINITIONS
