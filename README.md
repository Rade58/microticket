# ENABLING SSL CERTIFICATE ON OUR K8S PRODUCTION CLUSTER

ZELIM DAKLE DA ENABLE-UJEM HTTPS ZA NAS CLUSTER NA DIGITAL OCEAN-U

STVARI CE BITI POMALO KOMPLIKOVANE

KORISTICU [cert-manager](https://cert-manager.io/)-A , KOJEM JE JEDAN OD GLAVNIH BENEFITA SELF RENEWAL OF CERTIFICATE (ALI NIJE SAMO TO JEDINI BENEFIT)

A PRATICU OVAJ [YOUTUBE TUTORIAL](https://www.youtube.com/watch?v=hoLUigg4V18); MEDJUTIM U VECOJ MERI MI JE POMOGAO[OVAJ CLANAK, KOJI SE TICE DIGITAL OCEANA ESPECIALLY](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes) I [ZVANICN DOCSI](https://cert-manager.io/docs/configuration/acme/#configuration)

**PRVA GLAVNA STVAR JESTE DA CEMO OPET DA PROMENIMO CONTEXT, JER ZELIMO DA SA kubectl UPRAVLJAMO SA NASIM PRODUCTION CLUSTER-OM**

- `kubectl config get-contexts`

- `kubectl config use-context <ime contexta vezanog za tvo jcluster na digital ocean-u>`

# 1. SADA CU DA DOWNLOAD-UJEM CERT MENAGER YAML FILE, KORISCENJEM curl-A 

OTISAO SAM U [releases SECTION ZA cert-manager](https://github.com/jetstack/cert-manager/releases)

TU MOZES IZABRATI ZELJENI RELEASE KOJI BI TI ZELEO DA DEPLOY-UJES TO YOUR ENVIROMENT

JA SAM IZABRAO RELEASE 1.3.1, JER NIJE PRE-APLPHA, A OZNACEN JE KAO LATEST, STO MI GOVORI DA JE TO LATEST STABILE RELEASE (TO PREDPOSTAVLJAM JA)

KLIKNI NA POMENUTI RELEASE

TU CES VIDETI `cert-manager.yaml` FILE

MOZES GA DOWNLOAD-OVATI DIREKTNO ILI KORISTITI curl, JA CU DA ISPROBAM CURL, NA LINK ZA GORNJI FILE PRITISNI **`Right Click`** PA `Copy link address`

ALI DOWNLOAD-OVACU GA INSIDE FOLDER, KOJI CU NAZVATI `cert-manager`

- `mkdir cert-manager`

- `cd cert-manager`

- `curl -LO https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml`

OVO JE DOWNLOAD-OVALO POMENUTI FILE U cert-manager DIRECTORY

AUTOR TUTORIJLA JE PREIMENOVAO FAJL, DODAJUCI MU VERZIJU, STO CU I JA URADITI

- `mv cert-manager.yaml cert-manager-1.3.1.yaml`

MADA TO PREIMENOVANJE NIJE NESTO STO JE CRUCIAL

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

# 3. DOBRO, SADA CU DA DEPLOY-UJEM CERT MANAGERA, U NOVOM NAMESPACE-U, KOJI CE PO DEFAULTU BITI KREIRAN

  KUCAJ SVE OVE FLAGOVE KADA BUDES RUNN-OVAO COMMAND

- `kubectl apply --validate=false -f cert-manager/cert-manager-1.3.1.yaml`

**TREBALO BI DA SI SAD DOBIO I cert-manager NAMESPACE** (A DOBIO SI GA ZATO, JER JE U YAML FILE-U BIO SPECIFICIRAN namespace FIELD)

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
cert-manager      Active   82m
default           Active   3d21h
ingress-nginx     Active   2d18h
kube-node-lease   Active   3d21h
kube-public       Active   3d21h
kube-system       Active   3d21h
```

DA VIDIM KOJE PODS SADA IMAM U cert-manger NAMESPACE-U

- `kubectl get pods -n cert-manager`

```zsh
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-7dd5854bb4-pmbcb              1/1     Running   0          20s
cert-manager-cainjector-64c949654c-5dmz7   1/1     Running   0          20s
cert-manager-webhook-6bdffc7c9d-vvrz4      1/1     Running   0          19s
```

**DA VIDIS DA LI IMAS CLUSTER IP SERVICES TO EXPOSE, POMENUTE PODS, KUCAJ SLEDECU KOMANDU**

- `kubectl -n cert-manager get all`

```zsh
NAME                                           READY   STATUS    RESTARTS   AGE
pod/cert-manager-7dd5854bb4-f2p94              1/1     Running   0          84s
pod/cert-manager-cainjector-64c949654c-5fmxj   1/1     Running   0          84s
pod/cert-manager-webhook-6bdffc7c9d-9gvdn      1/1     Running   0          84s

NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/cert-manager           ClusterIP   10.245.188.140   <none>        9402/TCP   85s
service/cert-manager-webhook   ClusterIP   10.245.229.36    <none>        443/TCP    84s

NAME                                      READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cert-manager              1/1     1            1           85s
deployment.apps/cert-manager-cainjector   1/1     1            1           85s
deployment.apps/cert-manager-webhook      1/1     1            1           85s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/cert-manager-7dd5854bb4              1         1         1       85s
replicaset.apps/cert-manager-cainjector-64c949654c   1         1         1       85s
replicaset.apps/cert-manager-webhook-6bdffc7c9d      1         1         1       85s
```

KAO STO VIDIS GORNJI CLUSTER IP SERVICE-OVI **NEMAJU ASSIGNED EXTERNAL IPs**

VIDIMO GORE I DEPLOYMENTS

UGLAVNOM, TO SE TICE IP-JEVA, IT IS NICE AND SECURE IN ITS OWN NAMESPACE

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

CERT MANGER CE DEPLOY-OVATI A BOUNCH OF CUSTOM RESOURCE DEFINITIONS, I BICE NEW KUBERNATES OBJECTS INTRODUCED INTO OUR CLUSTER

DA HOOK-UJEMO UP CERT MANAGER SA LET'S ENCRYPT-OM, **MORAMO DEPPLOY-OVATI `issuer.yaml`**

ISSUER JE YAML FILE KOJI CE DEPLOY-OVATI CERTIFICATE AUTHORITY, A U NASEM SLUCAJU TO JE LET'S ENCRYPT

ONDA CEMO DEFINISATI JOS JEDAN YAML FILE, KOJI CE DEFINISATI ACTUAL CERTIFICATE WE NEED

THEN EVERYTHING ELSE CE SE DESAVATI AUTOMATSKI. **CERT MANAGER CE GENERISATI CERTIFICATE REQUEST OBJECT, I ONDA CE ORDER OBJECT BITI GENERISAN, I USED FOR LET;S ENCRYPT CERTIFICATE ORDER, CERTIFICATE REQUEST CE TAKODJE GENERISATI CHALLENGE OBJECT, POTREBNAN DA SE FULLFIL-UJE LETS ENCRYPT CHALLENGE**

KADA JE CHALLENGE FULLFILED OD STRANE CERT MANAGER-A, STATUS CERTIFICATA CE BITI PROMENJEN OD `status:in progress` DO `status:completed` I **KUBERNETES SECRET CE BITI CREATED `ILI UPDATED`**

## ALI PRE NEGO STO POCNEMO DA KORISTIMO REAL CA (CERTIFICATE AUTHORITY), HAJDE DA PROVERIMO DA LI NAS CERT MANGER RADI, TAKO STO CEMO KREIRATI SELF SIGNED CERTIFICATE

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
    email: bajic.rade.dev@gmail.com
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
  Creation Timestamp:  2021-05-24T18:33:33Z
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
    Time:         2021-05-24T18:33:33Z
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
    Time:            2021-05-24T18:33:34Z
  Resource Version:  154822
  UID:               b69e625c-3e6e-4ddd-bd0f-48230b0ae8b3
Spec:
  Acme:
    Email:            bajic.rade.dev@gmail.com
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
    Last Registered Email:  bajic.rade.dev@gmail.com
    Uri:                    https://acme-v02.api.letsencrypt.org/acme/acct/124683992
  Conditions:
    Last Transition Time:  2021-05-24T18:33:34Z
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
cert-manager-cainjector-token-bt7bv   kubernetes.io/service-account-token   3      62m
cert-manager-token-9xp5w              kubernetes.io/service-account-token   3      62m
cert-manager-webhook-ca               Opaque                                3      62m
cert-manager-webhook-token-qf98m      kubernetes.io/service-account-token   3      62m
default-token-95vtv                   kubernetes.io/service-account-token   3      62m
letsencrypt-cluster-issuer-key        Opaque                                1      2m31s
```

SECRET JE TU, KAO STO VIDIS IZNAD, POSLEDNJI JE NA LISTI

ALI MISLIM DA JA NECU DIREKTNO UPRAVLJATI NI JEDNIM OD TIH SECRET-OVA ,PA NI TIM, KOJI JE KREIRAN APPLYING-OM ISSUER-A

# 4. SADA CU INSIDE INGRESS CONFIGURATION ZADATI SECRET NAME, GDE CE SSL CERTIFICATE BITI LOCATED; MODIFIKOVACU U VELIKOJ MERI INGRESS, KAKO BI KORISTIO `apiVersion: networking.k8s.io/v1` (ZATO STO CU TAKO LAKSE PODESITI NEKE STVARI), JER IMAO SAM PROBLEMA NESTO DA PODESIM, U SLUCAJU BETA VERZIJE KOJU SAM KORISTIO, ALI NE SAMO TO, JA CU TAMO PODESITI MNOGO STVARI

- `code infra/k8s-prod/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    # MORAM DODATI OVO (OVO JE IME ISSUER-A, KOJE SMO MI DEFINISALI
    # AKO SE SECAS)
    cert-manager.io/cluster-issuer: "lets-enc-iss"
spec:
  # --------- DODAO SAM OVO ----------------------
  # ZADAO SAM I SECRET NAME
  tls:
    - hosts:
        - microticket.xyz
      secretName: micktick-tls
  # ----------------------------------------------
  rules:
    - host: microticket.xyz
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
    # OVDE ZADAJ TVOJ DOMAIN NAME (ZADAO SAM TO DAVNO RANIJE), ALI I https
    service.beta.kubernetes.io/do-loadbalancer-protocol: "https"
    service.beta.kubernetes.io/do-loadbalancer-hostname: "microticket.xyz"
    #
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

VAZNO JE ZNATI DA NEMAS NI JEDAN SSL CERTIFICATE LOCATED BILO GDE, JER TAJ CERTIFICATE ISS-UJE CERT MANAGER

DA SADA PPLY-UJEM GORNJU STVAR; **SSL NECE RADITI, JER NE POSTOJI secretName, KOJI SE ZOVE `micktick-tls`, U KOJEM OCEKUJEMO DA BUDE CERTIFICATE**

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
default-token-c7s9s   kubernetes.io/service-account-token   3      23h
jwt-secret            Opaque                                1      21h
micktick-tls          kubernetes.io/tls                     2      14s
stripe-secret         Opaque                                1      22h
```

DAKLE GORE JE UPRAVO SECRET, KOJI JE tls TIPA I KOJI IMA ONAKVO IMA KAAKVO SMO ZADALI `micktick-tls `

DA VIDIMO I NOVI CERTIFICATE

- `kubectl get certificates`

```zsh
NAME       READY   SECRET         AGE
micktick   True    micktick-tls   85s
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
  Creation Timestamp:  2021-05-24T19:03:38Z
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
    Time:         2021-05-24T19:03:38Z
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
    Time:            2021-05-24T19:04:06Z
  Resource Version:  159367
  UID:               ac8ddfc9-6d07-4ba8-8b59-c53e3f9abf40
Spec:
  Dns Names:
    microticket.xyz
    www.microticket.xyz
  Issuer Ref:
    Kind:       ClusterIssuer
    Name:       letsencrypt-cluster-issuer
  Secret Name:  micktick-tls
Status:
  Conditions:
    Last Transition Time:  2021-05-24T19:04:06Z
    Message:               Certificate is up to date and has not expired
    Observed Generation:   1
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2021-08-22T18:04:05Z
  Not Before:              2021-05-24T18:04:05Z
  Renewal Time:            2021-07-23T18:04:05Z
  Revision:                1
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    2m8s  cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  2m8s  cert-manager  Stored new private key in temporary Secret resource "micktick-tv5hn"
  Normal  Requested  2m8s  cert-manager  Created new CertificateRequest resource "micktick-nb94c"
  Normal  Issuing    100s  cert-manager  The certificate has been successfully issued

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
  micktick-tls terminates microticket.xyz
Rules:
  Host             Path  Backends
  ----             ----  --------
  microticket.xyz  
                   /api/users/?(.*)      auth-srv:3000 (10.244.1.149:3000)
                   /api/tickets/?(.*)    tickets-srv:3000 (10.244.1.21:3000)
                   /api/orders/?(.*)     orders-srv:3000 (10.244.0.5:3000)
                   /api/payments/?(.*)   payments-srv:3000 (10.244.0.73:3000)
                   /?(.*)                client-srv:3000 (10.244.1.171:3000)
Annotations:       cert-manager.io/cluster-issuer: lets-enc-iss
                   kubernetes.io/ingress.class: nginx
                   nginx.ingress.kubernetes.io/use-regex: true
Events:
  Type    Reason             Age                From                      Message
  ----    ------             ----               ----                      -------
  Normal  Sync               49s (x5 over 22h)  nginx-ingress-controller  Scheduled for sync
  Normal  CreateCertificate  49s                cert-manager              Successfully created Certificate "micktick-tls"

```

KAO STO VIDIM U GORNJIM EVENTOVIMA, ZAISTA JE CERTIFICATE KREIRAN

AKO TI JE OTVOREN VEC BIO <http://microticket.xyz> INSIDE BROWSER, MOZES DA RELOAD-UJES PAGE I VIDECES DA CE BITI SERVED <https://microticket.xyz> (DAKLE USPESNO JE KRIRAN CERTIFICATE I SVE JE SERVED OVER HTTPS)

ILI, AKO NIJE BIO OTVOREN U BROWSER-U, PROSTO OTVORI BROWSER TAB I KUCAJ <https://microticket.xyz>, I SVE CE BITI OK

DAKE CONNECTION JE SECURE (VIDIS I KATANAC UZ URLON TAB IN BROWSER, KAKO POKAZUJE DA JE SECURE) 

PRITISNI NA KATANAC, PA PRITISNI NA `"Certificate"`, I VIDECES VALIDNI SERTIFIKAT

## DAKLE SADA IMAMO `LET'S ENCRYPT` BROWSER TRUSTED CERTIFICATE, INSIDE SECRET, INSIDE OUR CLUSTER

CERT MANAGER CE WATCH-OVATI SECRET, I ALSO CE JE UPDATE-OVATI, KADA BUDE EXPIRE-OVAO CERTIFICATE

# MEDJUTIM PRIMETI OSAM DA KADA ODEM NA www.microticket.xyz ,DA SE SERVIRA INVALID HTTPS CERTIFICATE

SVE JE U REDU KADA NE KUCAM `www.`, ALI KADA TO KUCAM ISPADNE PROBLEM I MORAM KUCATI ONO `thisisunsafe`

MISLIM DA JE PROBLEM U NEKOLIKO STVARI KOJE MORAMO PODESITI U INGRESS-U

**MISLIM STA BI KONKRETNO NAJVISE VOLE, JESTE DEFINISANJE REDIRECT-A, SA `www.microticket.xyz` NA `microticket.xyz`**
