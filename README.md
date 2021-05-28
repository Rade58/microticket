# ENABLING SSL CERTIFICATE ON OUR K8S PRODUCTION CLUSTER

PRVO CU DATI PAR DIGRESIJA ZA POCETAK, A KOJI SE TICU NECEGA STO SAM MOZDA DEFINISAO RANIJE A STA JE PROBLEMATICNO 

***
***

## digresija VEZANA ZA `CNAME` RECORD ZA NAS DOMAIN

IPAK CEMO PREPRAVITI RECORD, JER ZA SADA IMAMO 2 `A` RECORD-A, A IPAK BI TREBAL ODA IMAM JEDAN `A` RECORD KOJI POINT-UJE TO LOAD BALANCER-A, I JEDAN `CNAME` RECORD ZA `www`

NA DIGITAL OCEAN-U: `MANGE`->`Networking`->`Domains` I BIRAJ NAS DOMAIN (`microticket.xyz`)

UKLONI `A` RECORD ZA `www`

I ZADAJ OVO

SADA KLIKCEMO NA `CNAME` TAB DA TAMO NAPRAVIMO NOVI RECORD

- ZA `'HOSTNAME'` KUCAMO `www`

A ZA `'IS AN ALIAS OF'`, KUCAMO `@`

*'TTL'* MENJAMO NA 30 SEKUNDI

I PRITISKAM NA `Create Record`

SADA **AKO SU NAM KONFIGURACIJE INGRESS-A I LOAD BALANCER-A DOBRO DEFINISANE**, KADA ODEMO NA 

<http://www.microticket.xyz/>

PAGE CE BITI SERVED

MEDJUTIM AKO UNESES 

<http://microticket.xyz/> (DAKLE BEZ `www`)

TADA CES BITI REDIRECTED NA <http://www.microticket.xyz/>

I NARAVNO PAGE BI BIO, ISTO SERVED

## POKAZACU TI SADA, KAKO NAM IZGLEDA NASA INGRESS NGINX KONFIGURACIJA, KOJU SAM U PROSLOM BRANCH-U UPDATE-OVAO, KAKO BI KORISTILA NOVIJU VERZIJU API-A; A TAKODJE CEMO VIDETI I KONFIGURACIJU LOAD BALLANCER-A, KOJA JE U ISTOM FILE-U

- `cat infra/k8s-prod/ingress-srv.yaml`

A UZ TO CU TI RECI JOS PAR STVARI

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    # SAMO TI NAPOMINJEM DA SMO OVDE STAVILI host KOJI IMA www
    # U SEBI
    - host: www.microticket.xyz
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              service:
                name: tickets-srv
                port:
                  number: 3000
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              service:
                name: orders-srv
                port:
                  number: 3000
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              service:
                name: payments-srv
                port:
                  number: 3000
          - path: /?(.*)
            pathType: Exact
            backend:
              service:
                name: client-srv
                port:
                  number: 3000
# OVO JE LOAD BALANCER CONFIGURATION
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
    # ISTO TAKO ZA OVAJ LOAD BALANCER CONFIGURATION
    # ISTO SMO ZAALI HOST, KOJI IMA www INSIDE OF IT
    service.beta.kubernetes.io/do-loadbalancer-hostname: "www.microticket.xyz"
  labels:
    helm.sh/chart: ingress-nginx-2.11.1
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.34.1
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

ZA SADA SA OVOM KONFIGURACIJOM SVE FUNKCIONISE KAKO TREBA

**I MOZDA TI JE CUDNO, TO STO KORISTIS HOST SA `www` NA LOAD BALANCER CONFIGURATION-U, S OBZIROM DA TI JE LOAD BALANCER SPECIFICIRAN NA @ RECORDU, `ALI IPAK SVE FUNKCIONISE KAKO TREBA`**

ALI, NARAVNO NIJE ENABLED SSL, ODNOSNO NASA APLIKACIJA SE NE SERVE-UJE OVER HTTPS

MEDJUTIM ZA SADA MI JE BITNO DA NIGDE NE DOBIJAM OVAKAV PAGE, KADA UNSEM URL U BROWSER I PRITISNEM ENTER

![INGRESS 404](images/nginex%20404.jpg)

**DAKLE NAPOMINJEM TI DA NEMAM GORNJI PAGE, VEC SE MOJA APLIKACIJA SERVE-UJE KKAO TREBA**

ISTO TAKO I SLANJE REQUEST-OVA FUNKCIONISE, BEZ OBZIRA DA LI JE TO FROM CLIENT SIDE ILI FROM `getServerSideProps` (FROM NEXTJS SERVER SIDE KA OSTALIM MICROSERVICE-OVIMA)

DA SE SADA VRATIM NA ONO STA JE TEMA OVE LEKCIJE, A TO JE SSL, ODNOSNO HTTPS

***
**

# CERT MANAGER

ZELIM DAKLE DA ENABLE-UJEM HTTPS ZA NAS CLUSTER NA DIGITAL OCEAN-U

STVARI CE BITI POMALO KOMPLIKOVANE

KORISTICU [cert-manager](https://cert-manager.io/)-A , KOJEM JE JEDAN OD GLAVNIH BENEFITA SELF RENEWAL OF CERTIFICATE (ALI NIJE SAMO TO JEDINI BENEFIT)

A PRATICU OVAJ [YOUTUBE TUTORIAL](https://www.youtube.com/watch?v=hoLUigg4V18); MEDJUTIM U ODREDJENOJ MERI MI JE POMOGAO[OVAJ CLANAK, KOJI SE TICE DIGITAL OCEANA ESPECIALLY](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes) (KONKRETNO MI JE POKAZAO DA MOGU ZADATI, JOS NEKE INGRESS ANNOTATIONS, ALI I ANNOTATIONS ZA LOAD BALANCER-A)

PRATICU I [ZVANICNE DOCS-E](https://cert-manager.io/docs/configuration/acme/#configuration)

**PRVA GLAVNA STVAR JESTE DA CEMO OPET DA PROMENIMO CONTEXT, JER ZELIMO DA SA kubectl UPRAVLJAMO SA NASIM PRODUCTION CLUSTER-OM** (NARAVNO, AKO SI TO VEC URADIO, NE MORAS OPET)

- `kubectl config get-contexts`

- `kubectl config use-context <ime contexta vezanog za tvoj cluster na digital ocean-u>`

# 1. SADA CU DA DOWNLOAD-UJEM CERT MENAGER YAML FILE, KORISCENJEM curl-A

OTISAO SAM U [releases SECTION ZA cert-manager](https://github.com/jetstack/cert-manager/releases)

TU MOZES IZABRATI ZELJENI RELEASE KOJI BI TI ZELEO DA DEPLOY-UJES TO MY CLUSTER

JA SAM IZABRAO RELEASE 1.3.1, JER NIJE PRE-APLPHA, A OZNACEN JE KAO LATEST, STO MI GOVORI DA JE TO LATEST STABILE RELEASE (TO PREDPOSTAVLJAM JA)

KLIKNI NA POMENUTI RELEASE

TU CES VIDETI `cert-manager.yaml` FILE

MI SMO MOGLI APPLY-OVATI YAML FILE (DA DEPLOY-UJEMO CERT MANAGER-A), KORISCENEM URL-A, KAO STO JE [OBJASNJENO OVDE](https://cert-manager.io/docs/installation/kubernetes/#installing-with-regular-manifests), ALI CEMO GA MI DOWNLOAD-OVATI, KAKO BISMO IMALI TAJ FILE U NASEM REPO-U

MOZES GA DOWNLOAD-OVATI DIREKTNO ILI KORISTITI `curl` KOMANDE, JA CU DA ISPROBAM CURL, NA PAGE-U, LINK-A, KOJEG SAM TI OSTAVIO GORE, PRITISNI **`Right Click`** PA `Copy link address`, U SLUCAJO, POMENUTOG YAML FILE-A

ALI DOWNLOAD-OVACU GA INSIDE FOLDER, KOJI CU NAZVATI `cert-manager`

- `mkdir cert-manager`

- `cd cert-manager`

- `curl -LO https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml`

OVO JE DOWNLOAD-OVALO POMENUTI FILE U cert-manager DIRECTORY

AUTOR TUTORIJLA JE PREIMENOVAO FAJL, DODAJUCI MU VERZIJU, STO CU I JA URADITI

- `mv cert-manager.yaml cert-manager-1.3.1.yaml`

MADA TO PREIMENOVANJE NIJE NESTO STO JE CRUCIAL, ALI DOBRO JE OBZNANITI SAMOM SEBI, O KOJOJ SE VERZIJI ZNACI

# 2. NA MOM CLUSTERU `NECU KREIRATI` NOVI NAMESPACE, ON MY OWN KAKO BI U NJEGA DEPLOY-OVAO CERT MANAGER-A, JER CE SE TO DESITI AUTOMATSKI, KADA BUDES DEPLOY-OVAO, SAMOG CERT MANAGER-A

OVO MI JE PRVI PUT DA GOVORIM O KREIRANJU NAMESPACE; JA NECU KREIRATI NIKAKV NAMESPACE EKSPLICITNO, ALI CU TI POKAZATI KAKO SE TO ,INACE RADI, CISTO DA BI ZNAO U BUDUCNOSTI

PROVERICU, KOJE NAMESPACES VEC IMAM

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
default           Active   7h41m
ingress-nginx     Active   7h19m
kube-node-lease   Active   7h41m
kube-public       Active   7h41m
kube-system       Active   7h41m
```

DA INCE, HOCU DA KREIRAM NOVI NAMESPACE (ALI SADA, ZAISTA NECU DA KREIRAM NOVI NAMESPACE), KORISTIO BI OVU KOMANDU

- `kubectl create ns <IME NAMESPACE-A>`

A DA PROVERIM PODS VEZANE ZA JEDAN NAMESPACE

- `kubectl get pods --namespace=ingress-nginx` (MOZE I `kubectl get pods -n <ime namespace-a>`)

```zsh
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-7rl7p        0/1     Completed   0          7h20m
ingress-nginx-admission-patch-gmnjq         0/1     Completed   1          7h20m
ingress-nginx-controller-57cb5bf694-crc67   1/1     Running     0          7h20m
```

`"default"` NAMESPACE JE ONAJ KOJI KORISTIMO PO DEFAULTU KAD KUCAMO KOMANDE, BEZ SPECIFICIRANJA `-n` ILI BEZ `--namespace=`

# 3. DOBRO, SADA CU DA DEPLOY-UJEM CERT MANAGERA, U NOVOM NAMESPACE-U; TAJ NAMESPACE CE BITI KREIRAN, JER JE TAKO SPECIFICIRANO, UNUTAR SAMOG MANIFESTA: `cert-manager/cert-manager-1.3.1.yaml`

KUCAJ, SVE OVE FLAGOVE KADA BUDES RUNN-OVAO, SLEDECI COMMAND

- `kubectl apply --validate=false -f cert-manager/cert-manager-1.3.1.yaml`

KREIRACE SE JAKO MNOGO KUBERNETES OBJEKATA, KAO STO SE KREIRAO VEC BROJ, I ONDA KADA SMO INSTALIRALI, SAMI INGRESS, ODNOSNO LOAD BALANCER-A; ALI SADA SE KREIRALO MNOGO VISE OBJEKATA

**TREBALO BI DA SI SAD DOBIO I cert-manager NAMESPACE** (A DOBIO SI GA ZATO, JER JE U APPLIED YAML FILE-U BIO SPECIFICIRAN namespace FIELD)

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
cert-manager      Active   90s
default           Active   7h45m
ingress-nginx     Active   7h24m
kube-node-lease   Active   7h45m
kube-public       Active   7h45m
kube-system       Active   7h45m
```

DA VIDIM KOJE PODS SADA IMAM U cert-manger NAMESPACE-U

- `kubectl get pods -n cert-manager`

```zsh
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-7dd5854bb4-5mx8f              1/1     Running   0          111s
cert-manager-cainjector-64c949654c-vjj88   1/1     Running   0          112s
cert-manager-webhook-6bdffc7c9d-x726p      1/1     Running   0          111s
```

**DA VIDIS DA LI IMAS CLUSTER IP SERVICES TO EXPOSE, POMENUTE PODS, KUCAJ SLEDECU KOMANDU**

- `kubectl -n cert-manager get all`

```zsh
NAME                                           READY   STATUS    RESTARTS   AGE
pod/cert-manager-7dd5854bb4-5mx8f              1/1     Running   0          3m7s
pod/cert-manager-cainjector-64c949654c-vjj88   1/1     Running   0          3m8s
pod/cert-manager-webhook-6bdffc7c9d-x726p      1/1     Running   0          3m7s

NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/cert-manager           ClusterIP   10.245.84.16    <none>        9402/TCP   3m9s
service/cert-manager-webhook   ClusterIP   10.245.157.94   <none>        443/TCP    3m9s

NAME                                      READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cert-manager              1/1     1            1           3m8s
deployment.apps/cert-manager-cainjector   1/1     1            1           3m9s
deployment.apps/cert-manager-webhook      1/1     1            1           3m8s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/cert-manager-7dd5854bb4              1         1         1       3m8s
replicaset.apps/cert-manager-cainjector-64c949654c   1         1         1       3m9s
replicaset.apps/cert-manager-webhook-6bdffc7c9d      1         1         1       3m8s
```

KAO STO VIDIS GORNJI CLUSTER IP SERVICE-OVI **NEMAJU ASSIGNED EXTERNAL IPs**

UGLAVNOM, STO SE TICE IP-JEVA, THEY ARE NICE AND SECURE IN ITS OWN NAMESPACE

TAKODJE, VIDIMO GORE I DEPLOYMENTS, A I SERVICES

**NAIME, DALJE JA CU PODESAVATI, JOS DVE VRSTE KUBERNETES OBJECT-A: TO CE BITI: `Clusterissuer` I `Certificate`**

DA PROVERIM DA LI, TRENUTNO IMAM TAKVIH OBJEKATA (**NE BI TREBALO DA IH IMAM**)

- `kubectl get clusterissuers`

```zsh           
No resources found
```

- `kubectl get certificates`

```zsh
No resources found in cert-manager namespace.
```

# 3. SADA KADA SMO DEPLOY-OVALI CERT MANAGER-A, MORAMO GA HOOK-OVATI UP SA CERTIFICATE AUTHORITY; A MI CEMO KORISTITI `Let's Encrypt`

[Let's Encypt](https://letsencrypt.org/)

CERT MANGER JE DEPLOY-OVAO A BOUNCH OF CUSTOM RESOURCE DEFINITIONS, I NEW KUBERNATES OBJECTS ARE INTRODUCED INTO OUR CLUSTER, KAO ST OSAM TI REKO NEKI OD NJIH SU `Custerissuer` I `Certificate` OBJECT, ALI JOS IH NISMO DEPLOY-OVALI

DA HOOK-UJEMO UP CERT MANAGER SA LET'S ENCRYPT-OM, **MORAMO DEPPLOY-OVATI `issuer.yaml`**

ISSUER JE YAML FILE KOJI CE DEPLOY-OVATI CERTIFICATE AUTHORITY, A U NASEM SLUCAJU TO JE LET'S ENCRYPT

ONDA CEMO DEFINISATI JOS JEDAN YAML FILE, KOJI CE DEFINISATI ACTUAL CERTIFICATE WE NEED

THEN EVERYTHING ELSE CE SE DESAVATI AUTOMATSKI. **CERT MANAGER CE GENERISATI CERTIFICATE REQUEST OBJECT, I ONDA CE ORDER OBJECT BITI GENERISAN, I USED FOR LET'S ENCRYPT CERTIFICATE ORDER. CERTIFICATE REQUEST CE TAKODJE GENERISATI CHALLENGE OBJECT, POTREBNAN DA SE FULLFILL-UJE LETS ENCRYPT CHALLENGE**

KADA JE CHALLENGE FULLFILED OD STRANE CERT MANAGER-A, STATUS CERTIFICATA CE BITI PROMENJEN OD `status:in progress` DO `status:completed` I **KUBERNETES SECRET CE BITI CREATED `ILI UPDATED`**

## PRE NEGO STO POZELIS DA KORISTIMO REAL CA (CERTIFICATE AUTHORITY), MOZES DA PROVERIS DA LI CERT MANGER, ZAISTA RADI, TAKO STO KREIRAS SELF SIGNED CERTIFICATE

***
***

PRESKOCIO SAM OVAJ DEO, A TI GA POGLEDAJ [OVDE](https://github.com/marcel-dempers/docker-development-youtube-series/tree/master/kubernetes/cert-manager#test-certificate-issuing)

TAKODJE, GORNJI DO SI TREBO DA URADIS, JER TO TI JE TEST A SVE FUNKCIONISE KAKO TREBA

***
***



***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***


# DIGRESIJA ZA PODESAVANJE `nginx.ingress.kubernetes.io/from-to-www-redirect: "true"` ANNOTATION OPCIJE U INGRESS-U

**KONKRETNO GORNJI CNAME RECORD SAM ZADAO UMESTO A RECORD-A, DA BIH MOGAO DA ENABLE-UJEM TU OPCIJU U INGRESS-U, A TO JE OPCIJA [`nginx.ingress.kubernetes.io/from-to-www-redirect: "true"`](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#redirect-fromto-www)**

POMENUTA OPCIJA, KADA JE BUDEM NARAVNO PODESIO NA `"true"`, RESICE POMENUTI PROBLEM KOJI IMAMO, ODNONO KADA BUDEMO ODLAZILI NA `https://microticket.xyz/`, MI CEMO UVEK BITI REDIRECTED NA `https://microticket.xyz/`, ZA KOJI IMAMO ROUTING RULES

TAKODJE CU IZMENITI MALO INGRESS CONFIG KAKO BI KORISTIO `apiVersion: networking.k8s.io/v1` (ZATO STO CU TAKO LAKSE PODESITI NEKE STVARI U BUDUCNOSTI), JER IMAO SAM PROBLEMA NESTO DA PODESIM, U SLUCAJU BETA VERZIJE KOJU SAM KORISTIO (**IMAO SAM I WARNINGS DA TA BETA VERZIJA NE ODGOVARA MOM CLUSTER-U, ODNONO ONA JE FUNKCIONISALA, ALI JE DEPRECATED**)

- `code infra/k8s-prod/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    # EVO OVO SAM DODAO
    nginx.ingress.kubernetes.io/from-to-www-redirect: "true"
    # 
spec:
  rules:
    - host: www.microticket.xyz
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              service:
                name: tickets-srv
                port:
                  number: 3000
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              service:
                name: orders-srv
                port:
                  number: 3000
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              service:
                name: payments-srv
                port:
                  number: 3000
          - path: /?(.*)
            pathType: Exact
            backend:
              service:
                name: client-srv
                port:
                  number: 3000
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
    service.beta.kubernetes.io/do-loadbalancer-hostname: "microticket.xyz"
  labels:
    # IZ NEKIH RAZLOGA KOJI NISU POSEBNI, POVECAO SAM OVDE VERZIJU
    helm.sh/chart: ingress-nginx-2.11.1
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    # I OVDE PROMENIO VERZIJU
    app.kubernetes.io/version: 0.34.1
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

COMMIT-UJ OVO STO SMO NAPRAVILI I PUSH-UJ TO dev BRANCH, STO SMO RADILI RANIJE, PA MERG-UJ ,PULL REQUEST INTO `main` BRANCH (**KAKO BI SE DESIO ONAJ GITHUB WORKFLOW, KOJI CE NA KRAJU APPLY-OVATI CHANGES NA CLUSTER**)

KADA SE SVE TO DESILO, MOZES OTICI U BROWSER I KUCATI `https://microticket.xyz/` ,I TI CES BITI REDIRECTED NA <https://www.microticket.xyz/>

DA SE SADA VRATIMO NA TEMU OVE LEKCIJE, A TO JE ENABLING SSL ZA NAS CLUSTER

**POSTO, BEZ OBZIRA, STO MI KORISTIMO `https` KADA KORISTIMO URL-OVE, KAO STO SI I SAM MOGAO VIDETI, MI I DALJE MORAMO DA KUCAMO "`thisisunsafe`" U BROWSERU, KAKO BI NAM SE ACTUALLY PAGE PRIKAZO' A TO JE ZATO STO NEMAMO VALIDAN SSL CRTIFICATE**
