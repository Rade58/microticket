# ENABLING SSL CERTIFICATE ON OUR K8S PRODUCTION CLUSTER

PRVO CU DATI PAR DIGRESIJA ZA POCETAK, A KOJI SE TICU NECEGA STO SAM MOZDA DEFINISAO RANIJE A STA JE PROBLEMATICNO 

***
***
***

# `digresija` VEZANA ZA CNAME RECORD ZA NAS DOMAIN

IPAK CEMO PREPRAVITI RECORD, JER ZA SADA IMAMO 2 `A` RECORD-A, A IPAK BI TREBAL ODA IMAM JEDAN `A` RECORD KOJI POINT-UJE TO LOAD BALANCER-A, I JEDAN `CNAME` RECORD ZA `www`

NA DIGITAL OCEAN-U: `MANGE`->`Networking`->`Domains` I BIRAJ NAS DOMAIN (`microticket.xyz`)

UKLONI `A` RECORD ZA `www`

I ZADAJ OVO

SADA KLIKCEMO NA `CNAME` TAB DA TAMO NAPRAVIMO NOVI RECORD

- ZA `'HOSTNAME'` KUCAMO `www`

A ZA `'IS AN ALIAS OF'`, KUCAMO `@`

*'TTL'* MENJAMO NA 30 SEKUNDI

I PRITISKAM NA `Create Record`

DOBRO SADA MOZES DA UNESES <https://www.microticket.xyz/>

I JEDNOSTAVNO VIDECES NAS WEB APP NORMALNO

ALI KADA UNESES <https://microticket.xyz/> (**DAKLE BEZ `www`**); IMACES ONAJ NGINGX 404 PAGE

![INGRESS 404](images/nginex%20404.jpg)

**OVO JE ZATO STO SU ROUTING RULES U INGRESS-U DEFINISANA ZA `https://www.microticket.xyz/` A NE ZA `https://microticket.xyz/`;**

MEDJUTIM JA OVO MOGU RESITI, PODESAVANJEM JEDNE annotation OPCIJE U INGRESS-U

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

# CERT MANAGER

ZELIM DAKLE DA ENABLE-UJEM HTTPS ZA NAS CLUSTER NA DIGITAL OCEAN-U

STVARI CE BITI POMALO KOMPLIKOVANE

KORISTICU [cert-manager](https://cert-manager.io/)-A , KOJEM JE JEDAN OD GLAVNIH BENEFITA SELF RENEWAL OF CERTIFICATE (ALI NIJE SAMO TO JEDINI BENEFIT)

A PRATICU OVAJ [YOUTUBE TUTORIAL](https://www.youtube.com/watch?v=hoLUigg4V18); MEDJUTIM U ODREDJENOJ MERI MI JE POMOGAO[OVAJ CLANAK, KOJI SE TICE DIGITAL OCEANA ESPECIALLY](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes) (KONKRETNO MI JE POKAZAO DA MOGU ZADATI, JOS NEKE INGRESS ANNOTATIONS)

PRATICU I [ZVANICNE DOCS-E](https://cert-manager.io/docs/configuration/acme/#configuration)

**PRVA GLAVNA STVAR JESTE DA CEMO OPET DA PROMENIMO CONTEXT, JER ZELIMO DA SA kubectl UPRAVLJAMO SA NASIM PRODUCTION CLUSTER-OM** (NARAVNO, AKO SI TO VEC URADIO, NE MORAS OPET)

- `kubectl config get-contexts`

- `kubectl config use-context <ime contexta vezanog za tvo jcluster na digital ocean-u>`

# 1. SADA CU DA DOWNLOAD-UJEM CERT MENAGER YAML FILE, KORISCENJEM curl-A 

OTISAO SAM U [releases SECTION ZA cert-manager](https://github.com/jetstack/cert-manager/releases)

TU MOZES IZABRATI ZELJENI RELEASE KOJI BI TI ZELEO DA DEPLOY-UJES TO YOUR ENVIROMENT

JA SAM IZABRAO RELEASE 1.3.1, JER NIJE PRE-APLPHA, A OZNACEN JE KAO LATEST, STO MI GOVORI DA JE TO LATEST STABILE RELEASE (TO PREDPOSTAVLJAM JA)

KLIKNI NA POMENUTI RELEASE

TU CES VIDETI `cert-manager.yaml` FILE

MI SMO MOGLI APPLY-OVATI YAML FILE (DA DEPLOY-UJEMO CERT MANAGER-A), KORISCENEM URL-A, KAO STO JE [OBJASNJENO OVDE](https://cert-manager.io/docs/installation/kubernetes/#installing-with-regular-manifests) ,ALI CEMO GA MI DOWNLOAD-OVATI, KAKO BISMO IMALI TAJ FILE U NASEM REPO-U

MOZES GA DOWNLOAD-OVATI DIREKTNO ILI KORISTITI curl, JA CU DA ISPROBAM CURL, NA LINK ZA GORNJI FILE PRITISNI **`Right Click`** PA `Copy link address`

ALI DOWNLOAD-OVACU GA INSIDE FOLDER, KOJI CU NAZVATI `cert-manager`

- `mkdir cert-manager`

- `cd cert-manager`

- `curl -LO https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml`

OVO JE DOWNLOAD-OVALO POMENUTI FILE U cert-manager DIRECTORY

AUTOR TUTORIJLA JE PREIMENOVAO FAJL, DODAJUCI MU VERZIJU, STO CU I JA URADITI

- `mv cert-manager.yaml cert-manager-1.3.1.yaml`

MADA TO PREIMENOVANJE NIJE NESTO STO JE CRUCIAL, ALI DOBRO JE OBZNANITI SAMOM SEBI, O KOJOJ SE VERZIJI ZNACI

# 2. NA MOM CLUSTERU NECU KREIRATI NOVI NAMESPACE, ON MY OWN KAKO BI U NJEGA DEPLOY-OVAO CERT MANAGER-A, JER CE SE TO DESITI AUTOMATSKI, KADA BUDES DEPLOY-OVAO, SAMOG CERT MANAGER-A

OVO MI JE PRVI PUT DA GOVORIM O KREIRANJU NAMESPACE; JA NECU KREIRATI NIKAKV NAMESPACE EKSPLICITNO, ALI CU TI POKAZATI KAKO SE TO RADI, CISTO DA BI ZNAO U BUDUCNOSTI

PROVERITICU, KOJE NAMESPACES VEC IMAM

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
default           Active   3d6h
ingress-nginx     Active   2d3h
kube-node-lease   Active   3d6h
kube-public       Active   3d6h
kube-system       Active   3d6h
```

DA HOCU DA GA KREIRAM (ALI SADA, ZAISTA NECU DA KREIRAM NOVI NAMESPACE), KORISTIO BI OVU KOMANDU

- `kubectl create ns <IME NAMESPACE-A>`

DA PROVERIM PODS VEZANE ZA JEDAN NAMESPACE

- `kubectl get pods --namespace=ingress-nginx` (MOZE I `kubectl get pods -n <ime namespace-a>`)

```zsh
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-mq75f        0/1     Completed   0          2d3h
ingress-nginx-admission-patch-qbmlm         0/1     Completed   1          2d3h
ingress-nginx-controller-57cb5bf694-lgtnm   1/1     Running     0          2d3h
```

default NAMESPACE JE ONAJ KOJI KORISTIMO PO DEFAULTU KAD KUCAMO KOMANDE BEZ `-n` ILI BEZ `--namespace=`

# 3. DOBRO, SADA CU DA DEPLOY-UJEM CERT MANAGERA, U NOVOM NAMESPACE-U; TAJ NAMESPACE CE BITI KREIRAN, JER JE TAKO SPECIFICIRANO INSIDE MANIFEST: `cert-manager/cert-manager-1.3.1.yaml`

KUCAJ SVE OVE FLAGOVE KADA BUDES RUNN-OVAO, SLEDECI COMMAND

- `kubectl apply --validate=false -f cert-manager/cert-manager-1.3.1.yaml`

KREIRACE SE JAKO MNOGO KUBERNETES OBJEKATI, KAO STO SE KREIRAO VEC BROJ, KADA SMO INSTALIRALI, SAMI INGRESS

**TREBALO BI DA SI SAD DOBIO I cert-manager NAMESPACE** (A DOBIO SI GA ZATO, JER JE U APPLIED YAML FILE-U BIO SPECIFICIRAN namespace FIELD)

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
cert-manager      Active   89s
default           Active   4h51m
ingress-nginx     Active   4h43m
kube-node-lease   Active   4h51m
kube-public       Active   4h51m
kube-system       Active   4h51m
```

DA VIDIM KOJE PODS SADA IMAM U cert-manger NAMESPACE-U

- `kubectl get pods -n cert-manager`

```zsh
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-7dd5854bb4-znmb5              1/1     Running   0          2m3s
cert-manager-cainjector-64c949654c-mwpkm   1/1     Running   0          2m4s
cert-manager-webhook-6bdffc7c9d-54v6c      1/1     Running   0          2m3s
```

**DA VIDIS DA LI IMAS CLUSTER IP SERVICES TO EXPOSE, POMENUTE PODS, KUCAJ SLEDECU KOMANDU**

- `kubectl -n cert-manager get all`

```zsh
NAME                                           READY   STATUS    RESTARTS   AGE
pod/cert-manager-7dd5854bb4-znmb5              1/1     Running   0          2m42s
pod/cert-manager-cainjector-64c949654c-mwpkm   1/1     Running   0          2m43s
pod/cert-manager-webhook-6bdffc7c9d-54v6c      1/1     Running   0          2m42s

NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/cert-manager           ClusterIP   10.245.143.186   <none>        9402/TCP   2m43s
service/cert-manager-webhook   ClusterIP   10.245.125.177   <none>        443/TCP    2m43s

NAME                                      READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cert-manager              1/1     1            1           2m42s
deployment.apps/cert-manager-cainjector   1/1     1            1           2m43s
deployment.apps/cert-manager-webhook      1/1     1            1           2m42s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/cert-manager-7dd5854bb4              1         1         1       2m42s
replicaset.apps/cert-manager-cainjector-64c949654c   1         1         1       2m43s
replicaset.apps/cert-manager-webhook-6bdffc7c9d      1         1         1       2m42s
```

KAO STO VIDIS GORNJI CLUSTER IP SERVICE-OVI **NEMAJU ASSIGNED EXTERNAL IPs**

VIDIMO GORE I DEPLOYMENTS

UGLAVNOM, STO SE TICE IP-JEVA, THEY ARE NICE AND SECURE IN ITS OWN NAMESPACE

**NAIME, DALJE JA CU PODESAVATI, JOS DVE VRSTE KUBERNETES OBJECT-A: TO CE BITI: `Clusterissuer` I `Certificate`**

DA PROVERIM DA LI IMAM TAKVIH OBJEKATA (**NE BI TREBALO DA IH IMAM**)

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

CERT MANGER JE DEPLOY-OVAO A BOUNCH OF CUSTOM RESOURCE DEFINITIONS, I NEW KUBERNATES OBJECTS ARE INTRODUCED INTO OUR CLUSTER

DA HOOK-UJEMO UP CERT MANAGER SA LET'S ENCRYPT-OM, **MORAMO DEPPLOY-OVATI `issuer.yaml`**

ISSUER JE YAML FILE KOJI CE DEPLOY-OVATI CERTIFICATE AUTHORITY, A U NASEM SLUCAJU TO JE LET'S ENCRYPT

ONDA CEMO DEFINISATI JOS JEDAN YAML FILE, KOJI CE DEFINISATI ACTUAL CERTIFICATE WE NEED

THEN EVERYTHING ELSE CE SE DESAVATI AUTOMATSKI. **CERT MANAGER CE GENERISATI CERTIFICATE REQUEST OBJECT, I ONDA CE ORDER OBJECT BITI GENERISAN, I USED FOR LET'S ENCRYPT CERTIFICATE ORDER, CERTIFICATE REQUEST CE TAKODJE GENERISATI CHALLENGE OBJECT, POTREBNAN DA SE FULLFIL-UJE LETS ENCRYPT CHALLENGE**

KADA JE CHALLENGE FULLFILED OD STRANE CERT MANAGER-A, STATUS CERTIFICATA CE BITI PROMENJEN OD `status:in progress` DO `status:completed` I **KUBERNETES SECRET CE BITI CREATED `ILI UPDATED`**

## PRE NEGO STO POZELIS DA KORISTIMO REAL CA (CERTIFICATE AUTHORITY), MOZES DA PROVERIS DA LI CERT MANGER, ZAISTA RADI, TAKO STO KREIRAS SELF SIGNED CERTIFICATE

<<<<<<< HEAD
***
***

PRESKOCIO SAM OVAJ DEO, A TI GA POGLEDAJ OVDE: [TEST CERTIFICATE ISSUING](https://github.com/marcel-dempers/docker-development-youtube-series/tree/master/kubernetes/cert-manager#test-certificate-issuing)

***
***

## MI CEMO KORISTI ACMA ISSUER

[ACME ISSUER](https://cert-manager.io/docs/configuration/acme/) JE LET'S ENCRYPT

MI CEMO KORISTITI EXITING INGRESS CONTROLER ZA ACCEPTING INCOMMING REQUESTS FOR THE LETS ENCRYPT CHALLENGE ,A TO CE NAM ALOW-OVATI DA SOLVE-UJEMO LET'S ENCRYPT CHALLENGE (NEKAD U BUDUCNOSTI [SAZNAJ STA JE LET'S ENCRYPT CHALLENGE SA OVOG LINKA](https://www.youtube.com/watch?v=jrR_WfgmWEw))

**PREGLEDACEMO SAMO SERVICES VEZANE ZA ingress-nginx NAMESPACE**

- `kubectl get services -n ingress-nginx`

```zsh
NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP       PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.245.120.216   microticket.xyz   80:30079/TCP,443:31637/TCP   21h
ingress-nginx-controller-admission   ClusterIP      10.245.120.119   <none>            443/TCP                      21h

```

MI IMAMO LOAD BALANCER KOJI IMA EXTERNAL IP, **A TU JE SPECIFICIRAN NAS DNS NAME**

DAKLE NAMA JE POMENUTI EXTERNAL IP NEOPHODAN DA BI MOGLI DA DEPLOY-UJEMO ISSUER-A

MI TO MOZEMO, JER IMAMO POMENUTE STVARI

SADA CEMO DA DEPLOY-UJEMO LET'S ENCRYPT [ISSUER-A](https://cert-manager.io/docs/configuration/acme/#configuration)

- `touch cert-manager/issuer.yaml`

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-cluster-issuer
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: rade.bajic.dev@gmail.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
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
letsencrypt-cluster-issuer   True    24s
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
  Creation Timestamp:  2021-05-25T20:15:03Z
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
    Time:         2021-05-25T20:15:03Z
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
    Time:            2021-05-25T20:15:05Z
  Resource Version:  37701
  UID:               a448518b-0c86-4568-8092-58e696efb584
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
    Uri:                    https://acme-v02.api.letsencrypt.org/acme/acct/124809020
  Conditions:
    Last Transition Time:  2021-05-25T20:15:05Z
    Message:               The ACME account was registered with the ACME server
    Observed Generation:   1
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
Events:                    <none>
```

ODOZGO MOZEMO VIDETI: *`The ACME account was registered with the ACME server`*

I STATUS JE READY

DA VIDIMO DA LI JE GENERISAN SECRET OBJECT

- `kubectl get secrets -n cert-manager`

```zsh
NAME                                  TYPE                                  DATA   AGE
cert-manager-cainjector-token-gj47h   kubernetes.io/service-account-token   3      46m
cert-manager-token-tz6wk              kubernetes.io/service-account-token   3      46m
cert-manager-webhook-ca               Opaque                                3      46m
cert-manager-webhook-token-l6tdm      kubernetes.io/service-account-token   3      46m
default-token-2hpww                   kubernetes.io/service-account-token   3      46m
letsencrypt-cluster-issuer-key        Opaque                                1      21m
```

SECRET JE TU, KAO STO VIDIS IZNAD, POSLEDNJI JE NA LISTI

ALI MISLIM DA JA NECU DIREKTNO UPRAVLJATI NI JEDNIM OD TIH SECRET-OVA ,PA NI TIM, KOJI JE KREIRAN APPLYING-OM ISSUER-A

# 4. SADA CU INSIDE INGRESS CONFIGURATION ZADATI SECRET NAME, GDE CE SSL CERTIFICATE BITI LOCATED; TAKODJE CU DODATI SOME ANNOTATIONS, A JEDNA OD NJIH CE SE TICATI TOGA KOJEG ISSUER-A KORISTIMO

- `code infra/k8s-prod/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/from-to-www-redirect: "true"
    # DODAO SAM OVO
    cert-manager.io/cluster-issuer: "letsencrypt-cluster-issuer"
spec:
  # ----------------------------------------------
  # DOADAO SAM SECRET, KOJI CE SE GENERISATI DA
  # U NJEGA ISSUER STAVI CERTIFIVCATE
  tls:
    - hosts:
        # DODACU OVDE I OVAJ HOST
        - www.microticket.xyz
      secretName: micktick-tls
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
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
    # OVDE SMO RANIJE ZADALI KOJI NAM HOST UPIRE U LOAD BALANCER-A
    service.beta.kubernetes.io/do-loadbalancer-hostname: "microticket.xyz"
    # A SADA CEMO DA ZADAMO KOJI JE ALLOWED PROTOCOL ZA LOAD BALANCER-A
    service.beta.kubernetes.io/do-loadbalancer-protocol: "https"
    #
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

VAZNO JE ZNATI DA NEMAS NI JEDAN SSL CERTIFICATE LOCATED BILO GDE, JER TAJ CERTIFICATE ISS-UJE CERT MANAGER

DA SADA APPLY-UJEM GORNJU MANIFEST; **SSL NECE RADITI, JER NE POSTOJI `secretName`, KOJI SE ZOVE `micktick-tls`, U KOJEM OCEKUJEMO DA BUDE CERTIFICATE**

ZATO JOS NECEMO PRAVITI ONAJ PULL REQUEST I MERGING, STO BI NA KRAJU DOVELO DA SE APPLY-UJE GORNJI FILE

TO CE SACEKATI DOK NE GENERISEMO SSL CERTIFICATE, ODNOSNO DOK NE KREIRAMO Certificate OBJECT U NASEM CLUSTERU

# 5. DA BISMO OMOGUCILI DA SE SSL CERTIFICATE GENERISE, INSIDE POMENUTOG SECRETA, KOJEM SMO DALI IME `micktick-tls`, ODNOSNO, KOJI SMO SPECIFICIRALI; MORACEMO DA DEPLOY-UJEMO CERTIFICATE OBJECT TO `default` NAMESPACE 

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
    - www.microticket.xyz
  # SPECIFICIRAO ONAJ SECRET, U KOJI CE SE STAVITI CERTIFICATE
  # A KOJ ISAM SPECIFICIRAO I U INGRESS MANIFESTU
  secretName: micktick-tls
  # OVDE SPECIFICIRAMO IME ISSUER-A KOJEG SMO KREIRALI RANIJE
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
default-token-h2qm6   kubernetes.io/service-account-token   3      5h53m
jwt-secret            Opaque                                1      5h13m
micktick-tls          kubernetes.io/tls                     2      11s
stripe-secret         Opaque                                1      5h14m
```

DAKLE GORE JE UPRAVO SECRET, KOJI JE tls TIPA I KOJI IMA ONAKVO IMA KAAKVO SMO ZADALI `micktick-tls `

DA VIDIMO I NOVI CERTIFICATE

- `kubectl get certificates`

```zsh
NAME       READY   SECRET         AGE
micktick   True    micktick-tls   70s
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
  Creation Timestamp:  2021-05-25T20:52:50Z
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
    Time:         2021-05-25T20:52:50Z
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
    Time:            2021-05-25T20:53:18Z
  Resource Version:  43307
  UID:               68c896ea-4526-4631-84cd-b500659d8ad0
Spec:
  Dns Names:
    www.microticket.xyz
  Issuer Ref:
    Kind:       ClusterIssuer
    Name:       letsencrypt-cluster-issuer
  Secret Name:  micktick-tls
Status:
  Conditions:
    Last Transition Time:  2021-05-25T20:53:18Z
    Message:               Certificate is up to date and has not expired
    Observed Generation:   1
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2021-08-23T19:53:18Z
  Not Before:              2021-05-25T19:53:18Z
  Renewal Time:            2021-07-24T19:53:18Z
  Revision:                1
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    108s  cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  107s  cert-manager  Stored new private key in temporary Secret resource "micktick-tg9mk"
  Normal  Requested  107s  cert-manager  Created new CertificateRequest resource "micktick-zbr6h"
  Normal  Issuing    80s   cert-manager  The certificate has been successfully issued
```

MOZES GORE VIDETI VIDETI DA JE CERTIFICATE SUCCESSFULLY ISSUED

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
Address:          microticket.xyz
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
TLS:
  micktick-tls terminates www.microticket.xyz
Rules:
  Host                 Path  Backends
  ----                 ----  --------
  www.microticket.xyz  
                       /api/users/?(.*)      auth-srv:3000 (10.244.1.228:3000)
                       /api/tickets/?(.*)    tickets-srv:3000 (10.244.0.89:3000)
                       /api/orders/?(.*)     orders-srv:3000 (10.244.0.76:3000)
                       /api/payments/?(.*)   payments-srv:3000 (10.244.0.17:3000)
                       /?(.*)                client-srv:3000 (10.244.0.77:3000)
Annotations:           cert-manager.io/cluster-issuer: letsencrypt-cluster-issuer
                       kubernetes.io/ingress.class: nginx
                       nginx.ingress.kubernetes.io/from-to-www-redirect: true
                       nginx.ingress.kubernetes.io/use-regex: true
Events:
  Type    Reason             Age                  From                      Message
  ----    ------             ----                 ----                      -------
  Normal  Sync               38s (x9 over 5h40m)  nginx-ingress-controller  Scheduled for sync
  Normal  CreateCertificate  38s                  cert-manager              Successfully created Certificate "micktick-tls"
```

KAO STO VIDIM U GORNJIM EVENTOVIMA, ZAISTA JE CERTIFICATE KREIRAN

AKO TI JE OTVOREN VEC BIO <http://microticket.xyz> INSIDE BROWSER, MOZES DA RELOAD-UJES PAGE I VIDECES DA CE BITI SERVED <https://microticket.xyz> (DAKLE USPESNO JE KRIRAN CERTIFICATE I SVE JE SERVED OVER HTTPS)

ILI, AKO NIJE BIO OTVOREN U BROWSER-U, PROSTO OTVORI BROWSER TAB I KUCAJ <https://microticket.xyz>, I SVE CE BITI OK

DAKE CONNECTION JE SECURE (VIDIS I KATANAC UZ URLON TAB IN BROWSER, KAKO POKAZUJE DA JE SECURE) 

PRITISNI NA KATANAC, PA PRITISNI NA `"Certificate"`, I VIDECES VALIDNI SERTIFIKAT

## DAKLE SADA IMAMO `LET'S ENCRYPT` BROWSER TRUSTED CERTIFICATE, INSIDE SECRET, INSIDE OUR CLUSTER

CERT MANAGER CE WATCH-OVATI SECRET, I ALSO CE JE UPDATE-OVATI, KADA BUDE EXPIRE-OVAO CERTIFICATE

=======

>>>>>>> 9_4_0_0_USING_BASE_URL_DEPENDING_ON_NODE_ENVIROMENT
