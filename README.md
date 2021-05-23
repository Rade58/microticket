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

# 2. NA MOM CLUSTERU NECU KREIRATI NOVI NAMESPACE, ON MY OWN KAKO BI U NJEGA DEPLOY-OVAO CERT MANAGER-A, JER CE SE TO DESITI AUTOMATSKI

OVO MI JE PRVI PUT DA GOVORIM O KREIRANJU NAMESPACE; JA TO NECU URADITI ALI CU TI POKAZATI KAKO SE RADI

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

DA HOCU DA GA KREIRAM, ALI SADA NECU KREIRAM NOVI NAMESPACE

- `kubectl create ns <IME NAMESPACE-A>`

DA PROVERIM PODS VEZANE ZA JEDAN NAMESPACE

- `kubectl get pods --namespace=ingress-nginx`

```zsh
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-mq75f        0/1     Completed   0          2d3h
ingress-nginx-admission-patch-qbmlm         0/1     Completed   1          2d3h
ingress-nginx-controller-57cb5bf694-lgtnm   1/1     Running     0          2d3h
```

default NAMESPACE JE ONAJ KOJI KORISTIMO PO DEFAULTU

- `kubectl get pods` (MOZEMO I NE MORAMO KORISTITI ONAJ `--namespace` ILI `-n` FLAG)

**DOBRO, SADA CU DA DEPLOY-UJEM CERT MANAGERA, U NOVOM NAMESPACE-U, KOJI CE PO DEFAULTU BITI KREIRAN**

- `kubectl apply --validat=false -f cert-manager/cert-manager-1.3.1.yaml`

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
