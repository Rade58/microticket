# ENABLING SSL CERTIFICATE ON OUR K8S PRODUCTION CLUSTER

ZELIM DAKLE DA ENABLE-UJEM HTTPS ZA NAS CLUSTER NA DIGITAL OCEAN-U

STVARI SU NESTO KOMPLIKOVANIJE, I NECU TI DAVATI PREOPSIRNA OBJASNJENJA

JEDINO STO CU TI RECI JESTE DA CU KORISTITI [cert-manager](https://cert-manager.io/)-A , KOJEM JE JEDAN OD GLAVNIH BENEFITA SELF RENEWAL OF CERTIFICATE (ALI NIJE SAMO TO JEDINI BENEFIT)

A PRATICU OVAJ [YOUTUBE TUTORIAL](https://www.youtube.com/watch?v=hoLUigg4V18)

**PRVA GLAVNA STVAR JESTE DA CEMO OPET DA PROMENIMO CONTEXT, JER ZELIMO DA SA kubectl UPRAVLJAMO SA NASIM PRODUCTION CLUSTER-OM**

- `kubectl config get-contexts`

- `kubectl config use-context <ime contexta vezanog za tvo jcluster na digital ocean-u>`

# 1. SADA CU DA DOWNLOAD-UJEM CERT MENAGER YAML FILE, KORISCENJEM curl-A 

OTISAO SAM U [releases SECTION ZA cert-manager](https://github.com/jetstack/cert-manager/releases)

TU MOZES IZABRATI ZELJENI RELEASE KOJI BI TI ZELEO DA DEPLOY-UJES TO YOUR ENVIROMENT

JA SAM IZABRAO RELEASE 1.3.1, JER NIJE PRE-APLPHA, STO MI GOVORI DA JE TO LATEST STABILE RELEASE (TO PREDPOSTAVLJAM JA)

KLIKNI NA POMEENUTI RELEASE

TU CES VIDETI `cert-manager.yaml` FILE

MOZES GA DOWNLOAD-OVATI DIREKTNO ILI KORISTITI curl, JA CU DA ISPROBAM CURL, NA LINK ZA GORNJI FILE PRITISNI **`Right Click`** PA `Copy link address`

ALI DOWNLOAD-OVACU GA INSIDE FOLDER, KOJI CU NAZVATI `cert-manager`

- `mkdir cert-manager`

- `cd cert-manager`

- `curl -LO https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml`

OVO JE DOWNLOAD-OVALO POMENUTI FILE U cert-manager DIRECTORY

AUTOR TUTORIJLA JE PREIMENOVAO FAJL, DODAJUCI MU VERZIJU, STO CU I JA URADITI

- `mv cert-manager.yaml cert-manager-1.3.1.yaml`

MADA TO NIJE NESTO STO JE CRUCIAL

# 2. NA MOM CLUSTERU NECU KREIRATI NOVI NAMESPACE, ON MY OWN KAKO BI U NJEGA DEPLOY-OVAO CERT MANAGER-A, JER CE SE TO DESITI AUTOMATSKI, KADA BUDES DEPLOY-OVAO CERT MANAGER-A

OVO MI JE PRVI PUT DA GOVORIM O KREIRANJU NAMESPACE; JA TO NECU URADITI ALI CU TI POKAZATI KAKO SE TO RADI, CISTO DA BI ZNAO U BUDUCNOSTI

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

DA HOCU DA GA KREIRAM (ALI SADA NECU KREIRAM NOVI NAMESPACE), KORISTIO BI OVU KOMANDU

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

- `kubectl apply --validat=false -f cert-manager/cert-manager-1.3.1.yaml`

**TREBALO BI DA SI SAD DOBIO I cert-manager NAMESPACE**

- `k get ns`

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
pod/cert-manager-7dd5854bb4-pmbcb              1/1     Running   0          4m7s
pod/cert-manager-cainjector-64c949654c-5dmz7   1/1     Running   0          4m7s
pod/cert-manager-webhook-6bdffc7c9d-vvrz4      1/1     Running   0          4m6s

NAME                           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/cert-manager           ClusterIP   10.245.231.164   <none>        9402/TCP   4m8s
service/cert-manager-webhook   ClusterIP   10.245.228.235   <none>        443/TCP    4m7s

NAME                                      READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cert-manager              1/1     1            1           4m7s
deployment.apps/cert-manager-cainjector   1/1     1            1           4m7s
deployment.apps/cert-manager-webhook      1/1     1            1           4m6s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/cert-manager-7dd5854bb4              1         1         1       4m8s
replicaset.apps/cert-manager-cainjector-64c949654c   1         1         1       4m8s
replicaset.apps/cert-manager-webhook-6bdffc7c9d      1         1         1       4m7s

```

KAO STO VIDIS GORNJI CLUSTER IP SERVICE-OVI **NEMAJU ASSIGNED EXTERNAL IPs**

VIDIMO GORE I DEPLOYMENTS

UGLAVNOM, IT IS NICE AND SECURE IN ITS OWN NAMESPACE

# 3. SADA KADA SMO DEPLOY-OVALI CERT MANAGER-A, MORAMO GA HOOK-OVATI UP SA CERTIFICATE AUTHORITY; A MI CEMO KORISTITI `Let's Encrypt`

[Let's Encypt](https://letsencrypt.org/)

CERT MANGER CE DEPLOY-OVATI A BOUNCH OF CUSTOM RESOURCE DEFINITIONS, I BICE NEW KUBERNATES OBJECTS INTRODUCED INTO OUR CLUSTER

DA HOOK-UJEMO UP CERT MANAGER SA LET'S ENCRYPT-OM, **MORAMO DEPPLOY-OVATI `issuer.yaml`**

ISSUER JE YAML FILE KOJI CE DEPLOY-OVATI CERTIFICATE AUTHORITY, A U NASEM SLUCAJU TO JE LLET;S ENCRYPT

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
NAME                                 TYPE           CLUSTER-IP      EXTERNAL-IP           PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.245.51.192   www.microticket.xyz   80:31396/TCP,443:31888/TCP   2d18h
ingress-nginx-controller-admission   ClusterIP      10.245.92.41    <none>                443/TCP                      2d18h

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
  name: letsencrypt-issuer
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: bajic.rade2@hotmail.com
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-issuer-key
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
NAME                 READY   AGE
letsencrypt-issuer   True    56s
```

- `kubectl describe clusterissuer letsencrypt-issuer`

```zsh
Name:         letsencrypt-issuer
Namespace:    
Labels:       <none>
Annotations:  <none>
API Version:  cert-manager.io/v1
Kind:         ClusterIssuer
Metadata:
  Creation Timestamp:  2021-05-23T10:01:39Z
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
    Time:         2021-05-23T10:01:39Z
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
    Time:            2021-05-23T10:01:40Z
  Resource Version:  603471
  UID:               ec0bacdf-2497-4036-947d-c0cbd942ad3f
Spec:
  Acme:
    Email:            bajic.rade2@hotmail.com
    Preferred Chain:  
    Private Key Secret Ref:
      Name:  letsencrypt-issuer-key
    Server:  https://acme-staging-v02.api.letsencrypt.org/directory
    Solvers:
      http01:
        Ingress:
          Class:  nginx
Status:
  Acme:
    Last Registered Email:  bajic.rade2@hotmail.com
    Uri:                    https://acme-staging-v02.api.letsencrypt.org/acme/acct/19629712
  Conditions:
    Last Transition Time:  2021-05-23T10:01:40Z
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
cert-manager-cainjector-token-jdrwx   kubernetes.io/service-account-token   3      99m
cert-manager-token-n6d58              kubernetes.io/service-account-token   3      99m
cert-manager-webhook-ca               Opaque                                3      99m
cert-manager-webhook-token-lzc9z      kubernetes.io/service-account-token   3      99m
default-token-7jdg2                   kubernetes.io/service-account-token   3      99m
letsencrypt-issuer-key                Opaque                                1      2m

```

SECRET JE TU, KAO STO VIDIS IZNAD, POSLEDNJI JE NA LISTI

# 4. SADA CU INSIDE INGRESS CONFIGURATION ZADATI SECRET NAME, GDE CE SSL CERTIFICATE BITI LOCATED; A TO ZADAJES UNDER YUR HOST NAM

- `code infra/k8s-prod/ingress-srv.yaml`

```yaml


```

VAZNO JE ZNATI DA NEMAS NI JEDAN SSL CERTIFICATE LOCATED BILO GDE, JER TAJ CERTIFICATE ISS-UJE CERT MANAGER

DA SADA PPLY-UJEM GORNJU STVAR; **SSL NECE RADITI, JER NE POSTOJI secretName, KOJI SE ZOVE `tajna-je-tajna`, U KOJEM OCEKUJEMO DA BUDE CERTIFICATE**

ZATO JOS NECEMO PRAVITI ONAJ PULL REQUEST I MERGING, STO BI NA KRAJU DOVELO DA SE APPLY-UJE GORNJI FILE

TO CE SACEKATI DOK NE GENERISEMO SSL CERTIFICATE

# 5. DA BISMO OMOGUCIL IDA SE SSLE CERTIFICATE GENERISE, INSIDE POMENUTE SECRET, KOJ USMO SPECIFICIRALI; MORACEMO DA DEPLOY-UJEMO CERTIFICATE OBJECT TO cert-manager

- `touch cert-manager/certificate.yml`

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  # DAO SAM IME
  name: moj-sertifikat
  namespace: default
spec:
  # SPECIFICIRAO DNS NAME
  dnsNames:
    - www.microticket.xyz
  # SPECIFICIRAO SECRET, U KOJI CE SE DEPLOY-OVATI CERTIFICATE
  secretName: tajna-je-tajna
  # OVDE SPECIFICIRAMO IME ISSUER-A KOJEG SMO KREIRALI RANIJE
  issuerRef:
    name: letsencrypt-issuer
    kind: ClusterIssuer
```

DA GA DEPLOY-UJEMO

- `kubectl apply -f cert-manager/certificate.yml`

STA CE SE SADA DOGODITI?

CERT MANAGER CE POGLEDATI CERTIFICATE, ISSUE-OVACE CERTIFICATE REQUEST, PO KOJEM CE ORDERU BITI KREIRAN; A ORDER JE ACME CERTIFICATE ORDER, STO CE ISTO TAKO GENERISATI CERTIFICATE CHALLENGE OBJECT IN CLUSTER, STO CE SPECIFICIRATI CHALLENGE KOJI CERT MANAGER MORA DA ISPUNI

KADA JE TAJ PROCESS ZAVRSEN, MOCI CE SE VIDETI SECRET INSIDE NAMESPACE

DA BI SMO VIDELI TAJ PROCES MOZEMO KUCATI

- `kubectl describe certificate moj-sertifikat`

```zsh
Name:         moj-sertifikat
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  cert-manager.io/v1
Kind:         Certificate
Metadata:
  Creation Timestamp:  2021-05-23T12:28:18Z
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
    Time:         2021-05-23T12:28:18Z
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
    Time:            2021-05-23T12:28:46Z
  Resource Version:  624740
  UID:               46e7c8ef-fe5c-4587-b6e7-47a0ab30e6e4
Spec:
  Dns Names:
    www.microticket.xyz
  Issuer Ref:
    Kind:       ClusterIssuer
    Name:       letsencrypt-issuer
  Secret Name:  tajna-je-tajna
Status:
  Conditions:
    Last Transition Time:  2021-05-23T12:28:46Z
    Message:               Certificate is up to date and has not expired
    Observed Generation:   1
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2021-08-21T11:28:44Z
  Not Before:              2021-05-23T11:28:44Z
  Renewal Time:            2021-07-22T11:28:44Z
  Revision:                1
Events:
  Type    Reason     Age    From          Message
  ----    ------     ----   ----          -------
  Normal  Issuing    3m46s  cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  3m46s  cert-manager  Stored new private key in temporary Secret resource "moj-sertifikat-nzv8r"
  Normal  Requested  3m46s  cert-manager  Created new CertificateRequest resource "moj-sertifikat-7nh85"
  Normal  Issuing    3m18s  cert-manager  The certificate has been successfully issued

```

MOZES VIDETI DA JE CERTIFICATE SUCCESSFULLY ISSUED

MOGU PROVERITI DA LI JE KREIRAN SECRET KOJ ISMO SPECIFICIRALI DA CE SE ZVATI tajna-je-tajna

- `kubectl get secrets`

```zsh
NAME                  TYPE                                  DATA   AGE
default-token-mwdnw   kubernetes.io/service-account-token   3      3d23h
jwt-secret            Opaque                                1      2d20h
stripe-secret         Opaque                                1      2d20h
tajna-je-tajna        kubernetes.io/tls                     2      4m2s
```

VIDIMO GORE, POMENUTI SECRET

# 6. DA SADA COMMIT-UJEMO CHANGES KOJE SMO NAPRAVILI, KONKRETNO VEZANO ZA INGRESS MANIFEST, I DA NAPRAVIMO PULL REQUEST I DA GA MERGE-UJEMO INTO `main` 


***
***
***
***
***
***

# OSTAVLJM TI PODSETNIK

cookie-session SSL


INGRESS:

IMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***
***
