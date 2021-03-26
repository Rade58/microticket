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

TAJ IP MAPUJES DOO TOG URL (STO SAM JA VEC URADIO, U SLUCAJU PREDHODNOG PROJEKTA) (POGLEDAJ I SAM `cat /etc/hosts`) (MOZES DA UPOREDIS DA LI SU ISTI IP-JEVI; I ZAISTA JESU U MOM SLUCAJU)

NARAVNO TAJ URL SPECIFICIRAS KAO HOST U INGRESS CONTROLLER-U (STO SAM VEC JEDNOM RADIO ZA INGRESS KONFIGURACIJU IZ DRUGOG PROJEKTA)

JA CU SADA IZMISLITI NEKI NOVI BOGGUS DOMAIN NAME

- `code /etc/hosts`

```zsh
# Host addresses
127.0.0.1  localhost
127.0.1.1  eidolon-80r0
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters

# for my kubernetes firts project
# tricking nginx to believe that minikube ip
# is myblog.com

192.168.49.2 myblog.com
# OVO SAM DODAO SADA
192.168.49.2 microticket.com
```

# MEDJUTIM PROBLEM JE TO STO INGRESS KADA SE JEDNOM PODESI ON OSTAJE TU ;ODNONO KADA GA JEDNOM INSTALIRAS, ON RUNN-UJE ,A JA SAM GA INSTALIRAO ZA POTREBE PROSLOG PROJEKTA

EVO TI I DOKAZ

- `kubectl describe ingress` ILI KUCAJ `kubectl get ingress`

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

AKO TI SE DESIL ODA SI NEKAKO UNISTIO TAJ CONTROLLER, OPET GA [INSTALIRAJ ODAVDE](https://kubernetes.github.io/ingress-nginx/deploy/)

# JA SAMO TREBAM DA RITE-UJEM CONFIG FILE ZA INGRESS NGINX, KOJI CE ONDA KADA GA APPLY-UJEM OVERRIDE-OVATI KONFIGURACIJU KOJA JE DEFAULT ONE, ILI JE PODESENA PREDHODNIM PROJEKTOM

- `touch infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    # OVO SLUZI ZA ENABLING REGEX PATH-OVA, KOJE ZA SADA JOS NEMEM U OVOM PROJEKTU
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
      # REKAO SAM TI DA SAM OVAJ HOST PODESIO NA MOM RACUNARU
      # ODNONO CHEAT-UJEM KAKO SAM TO OBJASNIO U PREDHODNOM 
      # PROJEKTU ISADA SAM ZADAO OVAJ
    - host: "microticket.com"
      http:
        paths:
          - path: /api/users/currentuser
            pathType: Exact
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000

```

TI NE TREBAS SADA DA KORISTIS MANUELNO `kubectl apply`

# SADA MOZES DA TESTIRAS SVOJ API ENDPOINT, ALI DESICE SE PROBLEM SIGURNO I TO ZBOG MINICUBE-A

RANIJE SAM EXECUTE-OVAO KOMANDU `minikube delete`, JER BEZ TOGA NIJE RADIO SKAFFOLD KAKO TREBA

TO JE MEDJUTIM DISABLE-OVALO I ingress ADDON ZA MINIKUBE, ZATO MOJ POKUSAJ DA POSALJEM REQUEST BIO JE NEUSPESAN

ALI KADA SAM ENABLE0OVAO ingress

- `minikube addons enable ingress`

MOGAO SAM DA SALJEM REQUEST

- `http GET microticket.com/api/users/currentuser`

```zsh
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 32
Content-Type: text/html; charset=utf-8
Date: Fri, 26 Mar 2021 18:28:07 GMT
ETag: W/"20-Snf9C1Kawnpxc1TswxEK6VQitMc"
X-Powered-By: Express

Hello there, my name is Stavros.
```
