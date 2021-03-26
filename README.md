# `ingress-nginx` SETUP

PRE NEGO STO PODESIM INGRESS NARAVNO, TREBALO BI DA DEFINISEM JEDAN WORKING ROUTE U auth MIKROSERVISU

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

// EVO OVO JE RUTE KOJI TREBA DA RETURN-UJE SINGLE USER OBJECT
app.get("/api/users/currentuser", (req, res) => {
  // SAMO ZA SADA STMAPAM DUMMY RESPONSE

  res.send("Hello there, my name is Stavros.");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
```

DAKLE SKAFFOLD CE OPET REBUILD-OVATI IMAGE I OVERWRITE-OVATI ONAJ KOJI SE NALAZI U POD-U SA TIM NOVIM IMAGE-OM (TO SAM TI VEC MNOGO PUTA REKAO)

# IMAJ NA UMU DA CE OPET MORATI DA PODESIS ONAJ FAKE URL, ODNOSNO DA PREVARIS RACUNAR DA KADA BUDES REQUEST-OVAO TAJ URL, DA SE SERV-UJE TVOJ CLUSTER

ZA TO NA LINUX-U UZIMAM CLUSTER IP

- `minikube ip`

```zsh
192.168.49.2
```

TAJ IP MAPUJES DOO TOG URL (STO SAM JA VEC URADIO, U SLUCAJU PREDHODNOG PROJEKTA) (POGLEDAJ I SAM `cat /etc/hosts`)

NARAVNO TAJ URL SPECIFICIRAS KAO HOST U INGRESS CONTROLLER-U (STO SAM VEC JEDNOM RADIO ZA INGRESS KONFIGURACIJU IZ DRUGOG PROJEKTA)

# MEDJUTIM PROBLEM JE TO STO INGRESS KADA SE JEDNOM PODESI ON OSTAJE TU

EVO TI I DOKAZ

- `kubectl describe ingress`

```zsh
Name:             ingress-srv
Namespace:        default
Address:          
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
Rules:
  Host        Path  Backends
  ----        ----  --------
  myblog.com  
              /create   posts-srv:4000 (<error: endpoints "posts-srv" not found>)
Annotations:  kubernetes.io/ingress.class: nginx
              nginx.ingress.kubernetes.io/use-regex: true
Events:       <none>


```

**ZATO NE TREBAM UOPSTE DA INSTALIRAM OPET INGRESS NGINX, JER NISAM MANUELN ODELET-OVAO INGRESS NGINX ILI URADIO NESTO SLICNO TOME**

# JA SAMO TREBAM DA RITE-UJEM CONFIG FILE ZA INGRESS NGINX, KOJI CE ONDA KADA GA APPLY-UJEM OVERRIDE-OVATI KONFIGURACIJU KOJA JE DEFAULT ONE, ILI JE PODESENA PREDHODNIM PROJEKTOM

- `touch infra/k8s/ingress-srv.yaml`

```yaml

```
