# CROSS NAMESPACE COMUNICATION BETWEEN CLUSTERS SERVICES

U PROSLOM BRANCH-U SAM TI REKAO O PROBLEMU KOJI IMAMO

A ON SE OGLEDA U TOME DA MORAMO DA KOMUNICIRAMO IZMEDJU NEXTJS SERVERA (FROM INSIDE `getServerSideProps` HOOK-A) KOJI JE U ITS OWN POD U NASEM CLUSTERU I INGRESS NGINX KAKO BISMO INGESS NGINX-U PROSLEDILI REQUEST KOJI BI ON ONDA ROUTE-OVAO DO auth MICROSERVICE-A

***
***

**DIREKTNU KOMUNIKACIJU IZMEDJU CLUSTER IP SERVICE NECEMO KORISTITI (GOVORIM OVDE O KOMUNIKACIJI BETWEEN client AND auth)**

A DA TE PODSETIM, TAKVA KOMUNIKACIJ IDE TAKO STO KORISTIS CLUSTER IP SERVICE, IL ICLUTER IP NAME TOG SERVICE-A PREMA KOME SALJES REQUEST (OBTAIN-UJES GA IL ICITANJEM KONFIG FAJLOVA ILI SA `kubectl get services`)

ALI KAO STO REKOH, JA TO NECU KORISTITI

***
***

**`ALI TICAJUCI SE KOMUNIKACIJE KOJA IDE DIRECTIONOM OD CLUSTER-OVOG PODA DO INGRESS-A (AKLE OVO JE OBRNUTA KOMUNIKACIJA OD ONE KOJU OBICNO KORISTIS); MORAMO VODITI RACUNA O NAMESPACE-OVIMA`**

# NAIME NAS POD U KOJEM JE client MICROSERVICE I INGRESS NGINX NE RUNN-UJU U ISTIM NAMESPACE-OVIMA

A STA JE TO NAMESPACE?

NESTO STO POSTOJI U SVETU KUBERNETES-A

JER SVI K8S OBJECTS KOJE KRIRAMO KREIRANI SU UNDER SPECIFIC NAMESPACE

**O NAMESPACE-OVIMA MOZEMO RAZMISLLJATI KAO O NEKIM TIPOVIMA SANDBOX-OVA**

SLUZE NAM ZA ORGANIZATION OF DIFFERENT OBJECTS

**DO SADA, MI SMO RADILI U NAMESPACE-U, KOJE SE ZOVE `default`, ODNOSNO SVI NASI KRIRANI OBJEKTI U KLUSTERU SU UNDER `default` NAMESPACE**

MOZEMO TO I DA PROVERIMO

- `kubectl get namespaces`

EVO VIDI STAA JE OUTPUT

```zsh
NAME              STATUS   AGE
default           Active   16d
ingress-nginx     Active   16d
kube-node-lease   Active   16d
kube-public       Active   16d
kube-system       Active   16d
```

VIDIS DA IMAS `default` NAMESPACE, A IMAS I `ingress-nginx` NAMESPACE

TU DAKLE NASTAJE PROBLEM KOJI BI ISAO OD NEKOG PODA IZ default NAMESPACE PREMA NMESPACE-I INGRESS NGINX-A

TI CES MORATI KORISTITI CROSS NAMESPACE KOMUNIKACIJU

# CROSS-NAMESPACE KOMUNIKACIJA KORISTI DRUGACIJI PATTERN; MORACES DA KONSTRUISES BASE URL NA NACIN KOJI CU TI SADA POKAZATI

PRVO MORAMO OTKRITI KOJI SVE SERVICE-I POSTOJE U `ingress-ngnx` NAMESPACE-U

TI KADA TRAZIS SERVICE-OVE OVAKO: `kubectl get services` PO DEFAULTU LIST-UJE SERVICEOVE IZ `default` NAMESPACE-A

**ALI TI MOZES KORISTITI `-n` FLAG ,DA KAZES IZ KOJEG NAMESPACE TI ZELIS DA LISTUJES SERVICES**

- `kubectl get services -n ingress-nginx`

```zsh
NAME                                 TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.68.1.177    34.89.40.241   80:30604/TCP,443:31539/TCP   16d
ingress-nginx-controller-admission   ClusterIP      10.68.12.148   <none>         443/TCP                      16d
```

GORE MOZES DA VIDIS LOAD BALANCER SERVICE INGRESS-A, A VIDIS I LOAD BALANCER-A

SADA FORMIRAS URL NA SLEDECI NACIN

`<ime load balancer-a>.<ime namespace ingress-a>.svc.cluster.local`

EVO TI GA, VISE PRAKTICNIJI PRIMER, DAKLE FORMIRAM ONAJ BASE URL, KOJI CU KKORISTITI ZA SLANJE REQUEST-OVA IZ `getServerSideProps` (IZ client-OVOG PODA)

`http://ingress-nginx-controller.ingress-nginx.svc.cluster.local`

DALJE BI NARAVNO DOADAO EKSTENZIJU, KOJA SE ODNOSI NA EXPRESS ENDPOINT, KO IZELI MDA HITT-UJEM

***
***

**digresija:**

`TI MOZES SKARATITI GORNJU URL, ODNOSNO ZADATI CUSTOM, MORE SIMPLER URL, ALI TADA BI MORAO DEFINISATI NESTO STA SE ZOVE` **`External Name Service`** (MISLIM DA SM SPOMINJAO OVAJ SERVICE, KOJI SE PRETEZNO KORISTIT KADA SE TESTIRA SINGLE POD (NI ZA STA DRUGO NEGO ZA TESTIRANJE, ALI OVDE BI BIO STVARNO CONVINIENT))

ON, ESSENTIALLY REMAP-UJE NOVI DOMAIN NAME DO OVOG PREDUGACKOG

ALI JA TO SADA NECU DEFINISATI JER TRAZI DEFINISANJE DODATNE KONFIGURACIJE; DAKLE NIJE PREKO POTREBNO I PREDSTAVLJA BIG LAYER OF INDIRECTION

ALI IT IS NICE TO HAVE IT

***
***

# TI SADA MOZES DA DEFINISEM SLANJE REQUEST I DA VIDIM STA CES DOBITI; ALI NEMOJ DA SE OBRADUJES PRE VREMENA, JER NECES DOBITI ONO STO ZELIS

NEMA VEZE, JA CU SADA IPAK NAPRAVITI REQUEST, KAKO BI VIDEO KAKV CES RESPONSE DOBITI

- `code client/pages/index.tsx`

FORMIRAO SAM URL; DAKLE SLACU REQUEST AGAINS THIS URL:

`http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  console.log({ props });

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie } = headers;

  console.log({ cookie });

  // EVO SALJEM REQUEST
  const response = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
    {
      headers: {
        cookie,
      },
    }
  );

  console.log({ data: response.data });

  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;
```

ERROR KOJ ICES DOBITI JE `Error: Request failed with status code 404`

OVAJ 404 ZNACI

**OVO ZNACI DA JE REQUEST USPESNO DOSAO DO INGRESS NGINX-A; ALI INGRESS NE ZNA KOJI DOMAIN POKUSAVAS DA ACCESS-UJES**

TAKO DA NEZNA KOJI CE SET OF RULES KORISTITI DA BI USPESNO ROUTE-OVAO REQUEST

- `code infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    # ON NE ZNA DA BI TI ZELEO DA SALJES AGAINST THIS HOST
    # JER TO NISI SPECIFICIRAO U SVOM REQUEST-U
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

DAKLE U REQUESTU NISTA NIJE BILO STO BI UKAZIVALO NA `microticket.com` HOST

## PROBLEM CES RESITI TAKO STO CES SPECIFICIRATI `host` HEADER U SVOM REQUEST-U

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

// NAMERNO SAM MALO PROSIRIO TYPE-OVE
interface PropsI {
  placeholder: boolean;
  data?: any;
  errors?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  const { data } = props;

  // OVO MI JE BITNO DA STAMPAM OVDE JER ZELIM DA VIDIM DA LI CE
  // DATA STICI DO KOMPONENTE
  console.log({ data});

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  console.log({ cookie, host });

  // DODAJEM try catch BLOK
  try {
    const response = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      {
        headers: {
          // EVO DODACU OVDE I host HEADER STO JE NAJVAZNIJE
          Host: "microticket.com",
          // COOKIE CU I DALJE DA SALJEM
          Cookie: cookie ? cookie : "", // OVO RADIM JER NE 
          //                      ZELIM DA BUDEM U MOGUCNOSTI
          //                DA SE NE PROSLEDJUJE undefined
          //                KAO COOKIE, JER CU TAKO DOBITI ERROR
        },
      }
    );

    console.log({ data: response.data });

    return {
      props: {
        placeholder: true,
        // NAMERNO PROSLEDJUJEM DATA U KOMPONENTU
        data: response.data as any,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        placeholder: true,
        // SLACU I OVO
        errors: err as any,
      },
    };
  }

};

export default IndexPage;
```

POSETIO SAM INDEX PAGE (MOZES DA PROBAS DA NAPRAVIS USERA NA PAGE `/auth/signup` PA DA ONDA BUDES REDIRECTED NA INDEX PAGE)

I EVO STA SE STAMPALO

```js
{
  data: {
    currentUser: {
      email: 'nickMullenComedy@mail.com',
      id: '6075e4a1795dac0023884ba7',
      iat: 1618338977
    }
  },
}
```

DAKLE SVE JE OK

**PROBAJ DA MANUELNO U BROWSER DEV TOOLSIMA UKLONIS COOKIE**

I ONDA RELOAD-UJE PAGE 

I ONO STO CE SE STAMPATI JE OVO

```js
{ data: { currentUser: null }}
```

# MOZES SADA DA ODRADIS MALO REFAKTORISANJA, I UNUTAR `getServerSideProps` ALI I U KOMPONENTI

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

// DA DEFINISEM BOLJI TYPESCRIPT SUPPORT
interface CurrentUserI {
  id: string;
  email: string;
  iat: number;
}

type currentUserType = CurrentUserI | null;

interface PropsI {
  data?: { currentUser: currentUserType };
  errors?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  const { data, errors } = props;

  console.log({ data, errors });

  // OVO SAM DODAO, CISTO DA PRIKAZEM ERRORS
  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    // NAMERNO SAM OVDE ZA ZA SADA DEFINISAO DA SE OVAKO
    // POKAZE DA LI JE USER SIGNED IN ILI NIJE
    return <div>You are {!currentUser ? "not" : ""} signed in.</div>;
  }

  return null;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  console.log({ cookie, host });

  try {
    const response = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      {
        headers: {
          // NE MORAS OVO DA HARDCODE-UJES
          // Host: "microticket.com",
          // MOZE I OVAKO
          Host: host,
          //
          Cookie: cookie ? cookie : "",
        },
      }
    );

    console.log({ data: response.data });

    return {
      props: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        // SLACU I OVO
        errors: err.message as any,
      },
    };
  }
};

export default IndexPage;
```

MOZES OVO DA TESTIRAS

PROBAJ PONOVO DA ODES NA `/auth/signin` PAGE PA DA SE PRIJAVIS

BICES PROGRAMATICALLY NAVIGATED SA TOG PAGE-A KADA TO OBAVIS, I BICES NA MANIN PAGE-U GDE CE NA STRANICI BITI RENDERED TEXT *"You are signed in."*
