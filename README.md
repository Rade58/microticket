# CONFIGURING THE DOMAIN NAME

KUPILI SMO `microticket.xyz` DOMAIN NAME U PROSLOM BRANCH-U

IDEM SADA U NAMECHEAP DASBOARD, I OTVARAM DOMAIN LIST, I BIRAM POMENUTI DOMAIN NAME, ODNOSNO PRITISKAM NA `MANAGE` DUGME, ZA TAJ DOMAIN NAME

***

digresija:

PRE TOGA MOZES PRIMAETITI DA TVOJ DOMAIN NAME IMA `Auto-Renew` CHECKED OUT; **E PA UNCHECK-UJ TO DA ZA GODINU DANA NE BI BIO BILLED, ODNOSNO DA AUTOMATSKI NE BI RINAJMIO DOMAIN**

***

TU MOGU CHANGE-OVATI KAKO DA SE PONASA, OVAJ DOMAIN NAME

**PROMENICEMO JEDINO `NAMESERVERS` ILI DNS SERVERS**

ZA OVU OPCIJU BIRAJ `Custom DNS`

**I TU ODMAH UNOSIMO 3 CUSTOM DNS-A, ODNOSNO TI CUSTOM NAME SERVERA, KOJA SU PROVIDED BY DIGITAL OCEAN**

DA VIDIS TE DNS-OVE MOZES OTICI U DIGITAL OCEAN DASBOARD, I TAMO IDI DA `Create` -> `Domains/DNS`

UNESI TAMO DOMAIN NAME `microticket.xyz` ZA PROJECT U KOJEM JE NAS CLUSTER A TO JE `microticket_project` I PRITISNI NA `Add Domain`

KADA SE TO ODRDI ODMAH CE TI BITI PRIKAZANI DNS RECORDS, I ONA TRI DNS-A

**KOPIRAJ IH I DODAJ IH U NAMECHEP-U I POMENUTOJ NEAMESERVERS SEKCIJI ZA TVOJ DOMAIN** PRITISNI NA GREEN CHECKMARK

RECENO MI JE DA DNS SETUP, ODNON DNS SERVER UPDATE MOZE POTRAJATI I DO 48 SATI

## SADA CEMO SE VRATITI U DIGITAL OCEAN U `MANGE`->`Networking`->`Domains` I BIRAJ NAS DOMAIN (microticket.xyz)

***

digresija:

PRVO CU TI RECI DAA SAM JA [DNS RECORDS PODESAVAO VEC JEDNOM, I TO JE BILO OVDE](https://github.com/Rade58/apis_trying_out_and_practicing/blob/master/Node.js/7.%20FULL%20STACK/d%29%20SETUP%20SERVER-A/2.%20DOMAIN%20SETUP.md)

TAK ODA CU KORISTITI I OBJASNJENJE SA POMENUTOG LINKA

***

OVDE MOZEMO PODESAVATI COUPLE OF DIFFERENT SETTINGS

MOZE DODATI NSOME NEW RECORDS TO CUSTOMIZE HOW DOMAIN NAME BEHAVES

**UNECU DVA ADDITIONAL RECORDS**

***

- U `A` TABU SAM (ZNACI DEFINISEMO `A RECORD`)

IMAS ONAJ HORIZONTALNI FORM, U KOJI PRVO UNOSIS `HOSTNAME` PA `WILL DIRECT TO` I `TTL(SECONDS)`

1. ZA *'HOSTNAME'* UNOSIS `@` 

2. ZA *'WILL DIRECT TO'* MOZES BIRATI, ODNOSNO SELECT-OVATI LOAD BLANCER-A KOJEG SA LISTE (AKO NE ZNAS STA JE SA LISTE LOAD BLANCER, VRATI SE U `Networking`->`Load Ballancers`, ALI BICE TI JASNO STA JE LOAD BALANCER, JER IMA IP UZ IME U TOM SELECT FIELD-U)

3. *'TLL'* (*'TIME TILL LIVE'*) MENJAM NA `30` SEKUNDI

I PRITISKAM NA `Create Record`

***

- SADA KLIKCEMO NA `CNAME` TAB DA TAMO NAPRAVIMO NOVI RECORD

1. ZA *'HOSTNAME'* KUCAMO `www`

2. A ZA *'IS AN ALIAS OF'*, KUCAMO `@`

3. `*'TTL'*` MENJAMO NA `30` SEKUNDI

I PRITISKAM NA `Create Record`

# SADA MORAMO DA ODEMO NA NAS INGRESS NGINX CONFIG FILE (infra/k8s-prod/ingress-srv.yaml), I TAMO MORAMO DA KAZEMO: WHEN EVER IS RUNNING IN PRODUCTION MODE, DA ZELIMO DA INGRESS CONTROLER WATCH-UJE FOR REQUEST COMING FROM DOMAIN OF `microticket.xyz`

ALI NE SETT-UJEMO SAMO host FIELD

***

[ZBOG NEKOG BUG-A, KOJI JE NA DIGITAL OCEAN-U](https://github.com/digitalocean/digitalocean-cloud-controller-manager/blob/master/docs/controllers/services/examples/README.md#accessing-pods-over-a-managed-load-balancer-from-inside-the-cluster), MORA SE DODATI ADDITIONAL CLUSTER IP KONFIGURACIJA

***

- `code infra/k8s-prod/ingress-srv.yaml`

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
    # EVO OVDE SMO ZADALI HOST microticket.xyz
    # ALI MORAS DA DODAS www ISPRED
    - host: www.microticket.xyz
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              serviceName: orders-srv
              servicePort: 3000
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              serviceName: payments-srv
              servicePort: 3000
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
# EVO JE TA CLUSTER IP KONFIGURACIJA, KOJU SAM DODAO
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: 'true'
    # OVDE ZADAJ TVOJ DOMAIN NAME
    service.beta.kubernetes.io/do-loadbalancer-hostname: 'www.microticket.xyz'
  labels:
    helm.sh/chart: ingress-nginx-2.0.3
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.32.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: http
    - name: https
      port: 443
      protocol: TCP
      targetPort: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
```

**NAIME BUG JE IZGLEDA TAKAV DA AKO GA NISAM POPRAVIO SA GORNJIM CLUSTER IP-JEM, DA NE BI UOPSTE MOGA OSLATI REQUESTS**

# RELATED TO MENTIONED DIGITAL OCEAN BUG, TREBAO BI PROMNITI BASE URL KOJI KORISTIM U `client`, ODNOSNO NEXTJS APLIKACIJI

OVO SE TICE SLANJE NETWORK REQUESTA, IZ JEDNOG PODA PREMA DRUGOM, JER SAM TAJ URL KORISTIO KAO BASE ZA PRAVLJANJE REQUESTOVA FROM `getServerSideProps` TO OTHER ENDPOINTS OF MICROSERVICES

- `code client/utils/buildApiClient.ts`

```ts
import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();
  // UMESTO OVOGA:
  // const baseURL =
    // "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";
  // KORITIM MOJ DOMAIN
    const baseURL =
    "http://www.microticket.xyz";

  if (isServerSide && ctx) {
    return axios.create({
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    return axios;
  }
};

```

OVO CE OCIGLEDNO BREAK-OVATI CODE CLIENT-A U DEVELOPMENT CLUSTERU NA GOOGLE CLOUD-U, ALI TREBA OVO DA NEGDE PRIBELEZIMA, JER CU MORTI NACI RESENJE ZA OVO

# SADA MORAMO PROCI ONAJ PROCES OD COMMITING-A SVEGA PA DO PAVVLJANJA PULL REQUEST-A, PA NJEGOVOG MERGING-A INTO `main`

NAKON KOJEG SE DOGADJA ACTION, KOJI SMO DEFINISALI DA SE TRIGGER-UJE PRI PUSHINGU INTO `main` (JER OPET TI NAPOMINJEM DA SE MERGING INTO `main` RACUNA KAO I PUSHING INTO `main`)

A SAMO TI NAPOMINJEM DA SE TAJ ACTION OBAVLJA JER SMO DEFINISALI OVAJ WORKFLOW: `.github/workflows/deploy-manifests.yml`

DA POCNEMO

- `git add -A`

- `git commit -am 'ingress config updated'`

- `git push origin dev`

SADA IDEMO NA GITHUB DA PRAVIMO NOVI PULL REQUEST ZA MERGING dev INTO main BRANCH

TO SMO URADILI I SADA CEMO DA MERGE-UJEMO POMENUTI PULL REQUEST INTO main

IDEMO U `Actions` TAB

KLIKCEMO NA ACTION KOJ ISE OBAVLJA I KLIKCEMO NA `build`

SVE SE USPESNO IZVRSILO, I OVO SAM MOGAO VIDETI, ZA SLUCAJ RUNNINGA kubectl apply KOMANDE:

```zsh
Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress
ingress.networking.k8s.io/ingress-srv configured
```

IGNORISACU POMENUTI WARNING, BITNO MI JE DA JE SVE BUILT

SACEKACU NEKIH 10 DO 15 MINUTA DA SE SVE CHANGES NAPRAVLJENE VEZAN ZA DOMAIN NAME (DNS STUFF) GO-UJU LIVE (U TEORIJI BICE BRZE)

ONDA MOGU TESTIRATI

**SADA SAM U BROWSER ADRESS BAR-U UNEO `http://www.microticket.xyz/`** I ZAISTA JE VIDIM NAS WEBPAGE

ALI NISAM SVE RESIO, NECU JOS POKUSATI DA KORISTIM APP JER NISAM SVE PODESIO

IMA NEKIH VAZNIH STVRI KOJE SE MORAJ USETT-OVATI UP

TO CU URADITI U SLEDECEM BRANCH-U

