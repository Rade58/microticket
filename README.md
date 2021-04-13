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

`TI MOZES SKARATITI GORNJU URL, ODNOSNO ZADATI CUSTOM, MORE SIMPLER URL, ALI TADA BI MORAO DEFINISATI NESTO STA SE ZOVE` **`EXTERNAL NAME SERVICE`**

ON, ESSENTIALLY REMAP-UJE NOVI DOMAIN NAME DO OVOG PREDUGACKOG

ALI JA TO SADA NECU DEFINISATI ZBOG

***
***

# TI SADA MOZES DA DEFINISEM SLANJE REQUEST I DA VIDIM STA CES DOBITI; ALI NEMOJ DA SE OBRADUJES PRE VREMENA, JER NECES DOBITI ONO STO ZELIS ZBOG DODATNE KONFIGURACIJE KOJU MORAS SPECIFICIRATI

NEMA VEZE, JA CU SADA IPAK NAPRAVITI REQUEST, KAKO BI VIDEO KAKV CES RESPONSE DOBITI

- `code client/pages/index.tsx`

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
    "http://ingress-nginx-controller-admission.ingress-nginx/api/users/current-user",
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

ERROR KOJ ICES DOBITI JE ``
