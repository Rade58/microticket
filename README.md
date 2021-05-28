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

## MI CEMO KORISTI ACMA ISSUER

[ACME ISSUER](https://cert-manager.io/docs/configuration/acme/) JE LET'S ENCRYPT

MI CEMO KORISTITI EXITING INGRESS CONTROLER ZA ACCEPTING INCOMMING REQUESTS FOR THE LETS ENCRYPT CHALLENGE ,A TO CE NAM ALOW-OVATI DA SOLVE-UJEMO LET'S ENCRYPT CHALLENGE (TI, NEKAD U BUDUCNOSTI [SAZNAJ VISE O TOME, STA JE USTVARI LET'S ENCRYPT CHALLENGE](https://www.youtube.com/watch?v=jrR_WfgmWEw))

**SADA, PREGLEDACEMO SAMO SERVICES VEZANE ZA ingress-nginx NAMESPACE**

- `kubectl get services -n ingress-nginx`

```zsh
NAME                                 TYPE           CLUSTER-IP     EXTERNAL-IP           PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.245.44.98   www.microticket.xyz   80:30750/TCP,443:31733/TCP   7h43m
ingress-nginx-controller-admission   ClusterIP      10.245.5.244   <none>                443/TCP                      7h43m
```

MI IMAMO LOAD BALANCER KOJI IMA EXTERNAL IP, **A TU JE SPECIFICIRAN I NAS DNS NAME: `www.microticket.xyz`**

DAKLE NAMA JE POMENUTI EXTERNAL IP NEOPHODAN DA BI MOGLI DA DEPLOY-UJEMO ISSUER-A

MI TO MOZEMO, JER IMAMO POMENUTE STVARI

SADA CEMO DA DEPLOY-UJEMO LET'S ENCRYPT [ISSUER-A](https://cert-manager.io/docs/configuration/acme/#configuration)

- `touch cert-manager/issuer.yaml`

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  # DAO SAM MU OVAKVO IME
  name: letsencrypt-cluster-issuer
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: rade.bajic.dev@gmail.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # MOZES RANDOM IME DATI I ZA SLEDECU STVAR
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-cluster-issuer-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
      - http01:
          ingress:
            class: nginx
```

GORE SMO SPECIFICIRALI SECRET OBJECT KOJI CE BITI GENERISAN, I U NJEMU CE BITI STORRED ISSUER KEY

- `kubectl apply -f cert-manager/issuer.yaml`

**MOZEMO PROVERITI CERT ISSUER-A**

- `kubectl get clusterissuers`

```zsh
NAME                         READY   AGE
letsencrypt-cluster-issuer   True    74s
```

- `kubectl describe clusterissuer letsencrypt-cluster-issuer`

```zsh
Name:         letsencrypt-cluster-issuer
Namespace:    
Labels:       <none>
Annotations:  <none>
API Version:  cert-manager.io/v1
Kind:         ClusterIssuer
Metadata:
  Creation Timestamp:  2021-05-28T16:37:40Z
  Generation:          1
  Managed Fields:
    API Version:  cert-manager.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:kubectl.kubernetes.io/last-applied-configuration:
      f:spec:
        .:
        f:acme:
          .:
          f:email:
          f:privateKeySecretRef:
            .:
            f:name:
          f:server:
          f:solvers:
    Manager:      kubectl-client-side-apply
    Operation:    Update
    Time:         2021-05-28T16:37:39Z
    API Version:  cert-manager.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:status:
        .:
        f:acme:
          .:
          f:lastRegisteredEmail:
          f:uri:
        f:conditions:
    Manager:         controller
    Operation:       Update
    Time:            2021-05-28T16:37:41Z
  Resource Version:  57083
  UID:               4826ee0c-5fad-40c6-a5a4-4fbbcb9561c0
Spec:
  Acme:
    Email:            rade.bajic.dev@gmail.com
    Preferred Chain:  
    Private Key Secret Ref:
      Name:  letsencrypt-cluster-issuer-key
    Server:  https://acme-v02.api.letsencrypt.org/directory
    Solvers:
      http01:
        Ingress:
          Class:  nginx
Status:
  Acme:
    Last Registered Email:  rade.bajic.dev@gmail.com
    Uri:                    https://acme-v02.api.letsencrypt.org/acme/acct/125158086
  Conditions:
    Last Transition Time:  2021-05-28T16:37:41Z
    Message:               The ACME account was registered with the ACME server
    Observed Generation:   1
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
Events:                    <none>
```

ODOZGO MOZEMO VIDETI: *`The ACME account was registered with the ACME server`*

I STATUS JE READY

SADA DA VIDIMO DA LI JE GENERISAN SECRET OBJECT

- `kubectl get secrets -n cert-manager`

```zsh
NAME                                  TYPE                                  DATA   AGE
cert-manager-cainjector-token-44q8n   kubernetes.io/service-account-token   3      33m
cert-manager-token-7n2mb              kubernetes.io/service-account-token   3      33m
cert-manager-webhook-ca               Opaque                                3      33m
cert-manager-webhook-token-vkh9s      kubernetes.io/service-account-token   3      33m
default-token-p8cwk                   kubernetes.io/service-account-token   3      33m
letsencrypt-cluster-issuer-key        Opaque                                1      3m8s
```

SECRET, U KOJI TREBA DA BUDE STORED SECRET ISSUER KEY JE TU, KAO STO VIDIS IZNAD, POSLEDNJI JE NA LISTI

ALI MISLIM DA JA NECU DIREKTNO UPRAVLJATI NI JEDNIM OD TIH SECRET-OVA ,PA NI TIM, KOJI JE KREIRAN APPLYING-OM ISSUER-A

# 4. SADA CU INSIDE INGRESS CONFIGURATION ZADATI SECRET NAME; DAKLE POTPUNO NOVI SECRET OBJECT, GDE CE SSL CERTIFICATE BITI LOCATED; ALI CU PODESITI I JOS NEKOLIKO STVARI

- `code infra/k8s-prod/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    # NISAM SIGURAN DA LI CE MI OVO TTREBATI, I ZATO CU SAMO STAVITI
    # ANNOTATIONS ALI CE BITI COMMENTED OUT
    # nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # nginx.ingress.kubernetes.io/from-to-www-redirect: "true"
    # MEDJUTIM MISLI MDA CE MI OVAJ ANNOTATION TREBATI
    # ON SPECIFICIRA ISSUER OBJECT
    cert-manager.io/cluster-issuer: "letsencrypt-cluster-issuer"
spec:
  # ----------------------------------------------
  # OVO ZNACI DA CE INGRESS KREIRATI SECRET
  # A U OVAJ SECRET, BI TREBALO DA SE STAVI
  # VALIDAN SSL SERTIFIKAT
  # KAO STO VIDIS SPECIFICIRAO SAM DHA HOST-A ZA KOJE
  # CE SE PRAVITI SERTIFIKAT
  tls:
    - hosts:
        - www.microticket.xyz
        - microticket.xyz
      secretName: micktick-tls
  # A KAO STO VIDIS IZNAD, DAO SAM SIME SECRETU   micktick-tls
  # ----------------------------------------------
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
# I U LOAD BALANCER CONFIGURATION-U CU DODATI NEKOLIKO ANNOTATION-A
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
    # USTVARI TO JE SAMO OVAJ
    service.beta.kubernetes.io/do-loadbalancer-protocol: "https"
    #
    service.beta.kubernetes.io/do-loadbalancer-hostname: "www.microticket.xyz"
  labels:
    # RANIJE SAM POVECAO OVU VERZIJU (NE IZ NEKIH POSEBNIH RAZLOGA)
    helm.sh/chart: ingress-nginx-2.11.1
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    # A I OVU VERZIJU OVDE
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

VAZNO JE ZNATI DA, DA TRENUTNO TI NEMAS NI JEDAN SSL CERTIFICATE LOCATED BILO GDE, JER TAJ CERTIFICATE ISS-UJE CERT MANAGER

A KADA BI SADA APPLY-OVAO, GORNJU STVAR; **SSL NE BI RADIO, JER NE POSTOJI `secretName`, KOJI SE ZOVE `micktick-tls`, U KOJEM OCEKUJEMO DA BUDE CERTIFICATE**

ZATO JOS NECEMO PRAVITI ONAJ PULL REQUEST I MERGING, STO BI NA KRAJU DOVELO DA SE APPLY-UJE GORNJI FILE

TO CE SACEKATI DOK NE GENERISEMO SSL CERTIFICATE, ODNOSNO DOK NE KREIRAMO Certificate OBJECT U NASEM CLUSTERU

# 5. DA BISMO OMOGUCILI DA SE SSL CERTIFICATE GENERISE, INSIDE POMENUTE SECRET, KOJEM SMO DALI IME `micktick-tls`, ODNOSNO, KOJI SMO SPECIFICIRALI; MORACEMO DA DEPLOY-UJEMO CERTIFICATE OBJECT TO `cert-manager` NAMESPACE 

- `touch cert-manager/certificate.yml`

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  # DAO SAM MU IME
  name: micktick
  # STAVLJAM GA U default NAMESPACE
  namespace: default
spec:
  # SPECIFICIRAO DNS NAME
  dnsNames:
    - microticket.xyz
    - www.microticket.xyz
  # SPECIFICIRAO ONAJ SECRET, U KOJI CE SE STAVITI CERTIFICATE
  # A KOJI SAM SPECIFICIRAO I U INGRESS MANIFESTU
  # JER CE TAJ SECRET PRAVITI INGRESS
  secretName: micktick-tls
  # OVDE SPECIFICIRAMO IME ISSUER-A KOJEG SMO KREIRALI RANIJE
  # I MI SMO MU DALI TO IME RANIJE
  issuerRef:
    name: letsencrypt-cluster-issuer
    kind: ClusterIssuer
```

DA GA DEPLOY-UJEMO

- `kubectl apply -f cert-manager/certificate.yml`

STA CE SE SADA DOGODITI?

CERT MANAGER CE POGLEDATI CERTIFICATE, ISSUE-OVACE CERTIFICATE REQUEST, PO KOJEM CE ORDERU BITI KREIRAN; A ORDER JE ACME CERTIFICATE ORDER, STO CE ISTO TAKO GENERISATI CERTIFICATE CHALLENGE OBJECT IN CLUSTER, STO CE SPECIFICIRATI CHALLENGE KOJI CERT MANAGER MORA DA ISPUNI

KADA JE TAJ PROCESS ZAVRSEN, MOCI CE SE VIDETI SECRET INSIDE NAMESPACE

- `k get secrets`

```zsh
NAME                  TYPE                                  DATA   AGE
default-token-n69lt   kubernetes.io/service-account-token   3      8h
jwt-secret            Opaque                                1      8h
micktick-tls          kubernetes.io/tls                     2      96s
stripe-secret         Opaque                                1      8h
```

DAKLE GORE JE UPRAVO SECRET, KOJI JE tls TIPA I KOJI IMA ONAKVO IMA KAKVO SMO ZADALI, A TO JE `micktick-tls`

DA VIDIMO I NOVI CERTIFICATE

- `kubectl get certificates`

```zsh
NAME       READY   SECRET         AGE
micktick   True    micktick-tls   3m3s
```

DA VIDIMO HOCEMO LI MOCI VIDETI SECRET INSIDE CERTIFICATE DESCRIPTION

- `kubectl describe certificate micktick`

```zsh
Name:         micktick
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  cert-manager.io/v1
Kind:         Certificate
Metadata:
  Creation Timestamp:  2021-05-28T16:54:05Z
  Generation:          1
  Managed Fields:
    API Version:  cert-manager.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:kubectl.kubernetes.io/last-applied-configuration:
      f:spec:
        .:
        f:dnsNames:
        f:issuerRef:
          .:
          f:kind:
          f:name:
        f:secretName:
    Manager:      kubectl-client-side-apply
    Operation:    Update
    Time:         2021-05-28T16:54:05Z
    API Version:  cert-manager.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:spec:
        f:privateKey:
      f:status:
        .:
        f:conditions:
        f:notAfter:
        f:notBefore:
        f:renewalTime:
        f:revision:
    Manager:         controller
    Operation:       Update
    Time:            2021-05-28T16:54:45Z
  Resource Version:  59673
  UID:               41a8a66b-2ab2-433d-b195-2f58502e9385
Spec:
  Dns Names:
    www.microticket.xyz
    microticket.xyz
  Issuer Ref:
    Kind:       ClusterIssuer
    Name:       letsencrypt-cluster-issuer
  Secret Name:  micktick-tls
Status:
  Conditions:
    Last Transition Time:  2021-05-28T16:54:45Z
    Message:               Certificate is up to date and has not expired
    Observed Generation:   1
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2021-08-26T15:54:44Z
  Not Before:              2021-05-28T15:54:44Z
  Renewal Time:            2021-07-27T15:54:44Z
  Revision:                1
Events:
  Type    Reason     Age    From          Message
  ----    ------     ----   ----          -------
  Normal  Issuing    3m51s  cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  3m51s  cert-manager  Stored new private key in temporary Secret resource "micktick-r7fws"
  Normal  Requested  3m51s  cert-manager  Created new CertificateRequest resource "micktick-fnprs"
  Normal  Issuing    3m11s  cert-manager  The certificate has been successfully issued
```

MOZES GORE VIDETI DA JE CERTIFICATE SUCCESSFULLY ISSUED

GORE VIDIS EVENTS, I ONI TACNO TAKO TREBA DA IZGLEDAJU

# 6. DA SADA COMMIT-UJEMO CHANGES KOJE SMO NAPRAVILI, KONKRETNO VEZANO ZA INGRESS MANIFEST, I DA NAPRAVIMO PULL REQUEST I DA GA MERGE-UJEMO INTO `main`

DAKLE POSTO IMAMO CERTIFICATE, MOZEMO REDEPLOY-OVATI NAS INGRESS CONTROLER

SVE SAM RAIO PO REDU OD PULLINGA, PA DO MERGINGA, PA SAM CEKAO DA SE IZVRSI GITHUB ACTION, KOJI JE APPLY-OVAO NOVU INGRESS KONFIGUACIJU

KUCACU SADA JEDNU KOMANDU KOJA BI TREBALA DA MI KAZE STA JE TO URADIO INGRESS U VEZI CERTIFICATE-A; ODNOSNO DA LI JE KREIRAN SERTIFIKAT

- `kubectl describe ingress`

POGLEDAJ EVENTS NA KRAJU

```zsh
Name:             ingress-srv
Namespace:        default
Address:          www.microticket.xyz
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
TLS:
  micktick-tls terminates www.microticket.xyz,microticket.xyz
Rules:
  Host                 Path  Backends
  ----                 ----  --------
  www.microticket.xyz  
                       /api/users/?(.*)      auth-srv:3000 (10.244.1.210:3000)
                       /api/tickets/?(.*)    tickets-srv:3000 (10.244.1.217:3000)
                       /api/orders/?(.*)     orders-srv:3000 (10.244.0.30:3000)
                       /api/payments/?(.*)   payments-srv:3000 (10.244.0.116:3000)
                       /?(.*)                client-srv:3000 (10.244.1.230:3000)
Annotations:           cert-manager.io/cluster-issuer: letsencrypt-cluster-issuer
                       kubernetes.io/ingress.class: nginx
                       nginx.ingress.kubernetes.io/use-regex: true
Events:
  Type    Reason             Age                  From                      Message
  ----    ------             ----                 ----                      -------
  Normal  Sync               31s (x5 over 6h56m)  nginx-ingress-controller  Scheduled for sync
  Normal  CreateCertificate  31s                  cert-manager              Successfully created Certificate "micktick-tls"
```

KAO STO VIDIM U GORNJIM EVENTOVIMA, ZAISTA JE CERTIFICATE KREIRAN

AKO TI JE OTVOREN VEC BIO <http://www.microticket.xyz> INSIDE BROWSER, MOZES DA RELOAD-UJES PAGE I VIDECES DA CE BITI SERVED <https://www.microticket.xyz> (DAKLE USPESNO JE KRIRAN CERTIFICATE I SVE JE SERVED OVER HTTPS)

VIDECES I KATANAC U ADRESS BAR-U, KOJI UKAZUJE DA JE PAGE SERVED OVER HTTPS; MOZES DA PRITISNES KATANAC I DA TU INSPECT-UJES CERTIFICATE

`DAKLE SADA IMAMO LET'S ENCRYPT BROWSER TRUSTED CERTIFICATE, INSIDE SECRET, INSIDE OUR CLUSTER; CERT MANAGER CE WATCH-OVATI SECRET, I ALSO CE JE UPDATE-OVATI, KADA BUDE EXPIRE-OVAO CERTIFICATE`

**ALI IMACEMO PROBLEM ZA** <https://microticket.xyz> (DAKLE ZA HOSTNAME, KOJI JE BEZ `www`)

I TO JE OVAJ PROBLEM:

![404](images/nginex%20404.jpg)

ALI MISLI MDA SE I GORNJI PAGE SERVE-UJE OVER HTTPS

# ZA RESAVANJE PROBLEMA SA 404 NGINX PAGE-OM, PROBACU DODAVANJEM NEKOLIKO ANNOTTIONA ,A MOZDA I SAMO JEDNOG ANNOTATION-A, U INGRES I LOAD BALANCER KONFIGURACIJE

- `code infra/k8s-prod/ingress-srv.yaml`

USTVARI DODACU nginx.ingress.kubernetes.io/from-to-www-redirect: "true" ANNOTATION

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
