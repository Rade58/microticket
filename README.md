# ENABLING SSL CERTIFICATE ON OUR K8S PRODUCTION CLUSTER

ZELIM DAKLE DA ENABLE-UJEM HTTPS ZA NAS CLUSTER NA DIGITAL OCEAN-U

STVARI SU NESTO KOMPLIKOVANIJE, I NECU TI DAVATI PREOPSIRNA OBJASNJENJA

JEDIN OSTO CU TI RECI JESTE DA CU KORISTITI [cert-manager](https://cert-manager.io/)-A , KOJEM JE JEDAN OD GLAVNIH BENEFITA SELF RENEWAL OF CERTIFICATE (ALI NIJE SAMO TO JEDINI BENEFIT)

A PRATICU OVAJ [YOUTUBE TUTORIAL](https://www.youtube.com/watch?v=hoLUigg4V18)

**PRV I GLAVNA STVAR JESTE DA CEMO OPET DA PROMENIMO CONTEXT, JER ZELIMO DA SA kubectl UPRAVLJAMO SA NASIM PRODUCTION CLUSTER-OM**

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

# 2. NA MOM CLUSTERU KREIRACU NOVI NAMESPACE,, KAKO BI U NJEGA DEPLOY-OVAO CERT MANAGER-A

OVO MI JE PRVI PUT DA KREIRAM NAMESPACE

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

KREIRAM NOVI NAMESPACE

- `kubectl create ns cert-manager`

- `kubectl get ns`

```zsh
NAME              STATUS   AGE
cert-manager      Active   6s
default           Active   3d6h
ingress-nginx     Active   2d3h
kube-node-lease   Active   3d6h
kube-public       Active   3d6h
kube-system       Active   3d6h
```

KAO STO VIDIS IMAM JEDAN DODATNI NAMESPACE



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
