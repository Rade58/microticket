# SERVER SIDE RENDERING WITH Next.js

KREIRACU NOVI NEXTJS PROJEKAT, KOJI KORISTI TYPESCRIPT

- `mkdir client`

- `cd client`

- `yarn init -y`

- `yarn add next react react-dom`

- `touch tsconfig.json`

- `yarn add typescript @types/react @types/node --dev`

- `touch next-env.d.ts`

- `code package.json`

```json
"scripts": {
  "dev": "next",
  "build": "next build",
  "start": "next start"
}
```

- `cd ..`

- `code .gitignore`

```py
# client app
client/node_modules
client/dist
client/public
client/.next
client/.env
```

## DA KREIRAMO HELLO WORLD PAGE KOMPONENTU ZA SADA I DA POKRENEMO DEV SCRIPT DA SE PODESI TYPESCRIPT I DA VIDIMO DA LI CE PAGE BITI SERVED 

- `cd client`

- `mkdir pages`

- `touch pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const PageName: FunctionComponent = () => {
  return <div>👾</div>;
};

export default PageName;

```

- `yarn dev`

PAGE JE SERVED NA <http://localhost:3000/>

DAKLE FUNKCIONISE

## U SLEDECEM BRANCH-U CU DOCKERIZOVATI OVAJ NEXTJS APP

ODNOSNO BUILD-OVCU DOCKER IMAGE
