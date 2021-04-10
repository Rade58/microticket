# ADDING GLOBAL CSS

**KORISTICU [BOOTSTRAP CSS](https://getbootstrap.com/)**

SADA CU DA GA WIRE-UJEM UP I KORISTIM U MOM PROJECT-U

BOOTSTRAP MI DAJE GLOBALNI CSS FILE, KOJI JE PREDVIDJEN DA SE APPLY-UJE NA ENTIRE APPLICATION; NA SVE DIFFERENT PAGES INSIDE OF IT

ZATO CU MORATI KORISTITI `/pages/_app.tsx` (CUSTOM APP)

- `touch client/pages/_app.tsx`

OVAKO IZGLEDA TP IZGLEDA

```tsx
import React from "react";
// import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

```

KAO STO VIDIS GORE NISAM ODAO BOOTSTRAP, ZELIM PRVO DA GA INSTALIRAM

- `cd client`

- `yarn add bootstrap@next`

**SADA MOZES DA UVEZES BOOTSTRAP U POMENUTI App COMPONENT**

- `touch client/pages/_app.tsx`

```tsx
import React from "react";
// EVO
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

## JA SAM ZBOG OVOGA MORAO DA UNISTIM POD U KOJEM JE APP, PA CE GA CUBERNETES OPET NAPRAVITI

MRZELO ME JE DA RESTART-UJEM SKAFFOLD

POKAZAO SAM TI U PROSLOM BRANCH-U KKO SE DELET-UJE PODD, KOJI CLUSTER AUTOOMATSKI PONOVO PRAVI

## UGLAVNOM SADA KADA ODES DA VIDIS NEXT APP U BROWSERU PRIMETICES DRUGACIJI FONT

TO SU APPLIRD BOOTSTRAP GLOBALN ISTILOVI
