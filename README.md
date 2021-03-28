# SETTING UP LOAD BALANCER AND THE REST

MORAM PODESITI ingress-nginx NA MOM CLUSTER-U NA GOOGLE CLOUD-U

OVO BI TREBALO DA BUDE EASY, A GLEDACU U DOKUMENTACIJU ingress-nginx

U DEPLOYMENT SEKCIJI IMA OBJASNJENJE ZA GOOGLE CLOUD

<https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke>

TO TI JE UNDER `GCE-GKE`

NEMOJ NISTA DA EXECUTE-UJES TA TI JE U OKVIRU INFO-A ILI DANGER ZONE-A, TI EXECUTE-UJES ONU `kubectl apply -f <URL>`

NIJE BITNO GDE OVO EXECUTE-UJES U TERMINALU (TO TI GOVORIM JER SI OVO LOKALNO EXECUTE-OVAO U infra/k8s FOLDERU)

- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/cloud/deploy.yaml`

DAKLE INSTALIRAO SAM ingress-nginx NA NASEM GOOGLE CLOUD CLUSTER-U

# SADA MORAM DA UPDATE-UJEM HOST FILE NA MOJOJ LOKALNOJ MACHINE-I, A SADA CU UZETI I SETTOVATI IP CLUSTER-A NA CLOUD-U (USTVARI UZIMAMO IP LOAD BALANCER-A NA CLOUD-U)

VEC SAM TI OBJASNJAVAO OVO, MAPP-OVACU ODREDJENI NAME DO IOO-JA LOAD BALANCER-A (USTVARI OVO JE SAMO DA NE MORAM DA PAMTIM IP LOAD BALANCER, VEC DA KORISTIM NEKI READABLE NAZIV ZA TAJ IP); USMERI PREMA INGRESS CONTROLLER-U, KOJI ONDA DIRECT-UJE TRAFFIC DO APPROPRIATE CLISTER IP SERVICE-A, KOJI SVAKI STOJI IN FRONT OF PODS OF SINGLE MICROSERVICE 

IP LOAD BALANCER-A MOGU NACI U DASBOARD-U U GOOGLE CLOUD-U

VEC STARTINGOM PROJECT-A BIO JE PROVISIONED LOAD BALANCER ZA NAS PROJECT

OTVORI HAMBURGER MENU I UNDER Networking NADJI `Network Services -> Load balancing`

LOAD BALANCER IMA RANDOMLY GENERATED NAME

KLIKNUO SAM NA TO IME I MOGU VIDETI UNDER IP:Port, UPRAVO IP ADRESS

TEBE SAMO ZANIMA IP, PREKOPIRAJ GA

**POSTO SAM GA PREKOPIRAO, SETT-UJEM GA UNDER HOSTS NA MOJOJ LOKALNOJ MACHINE-I**

- `sudo vi /etc/hosts`

```bash
# ZADAO SAM OVO
<ip adresa> microticket.com
```

# SADA MORAMO DA RESTART-UJEMO SKAFFOLD

U TEORIJI TO BI TREBALO DA UZME NAS auth-depl.yaml FILE I DEPLOY-UJE SVE NA GOOGLE CLOUD CLUSTER, I UZECE I SET OF OUR ROUTING RULES I TO CE APPLY-OVATI ON CLUSTER AS WELL

SKAFFOLD CE ATTEMPT-OVATI DA BUILD-UJE IMAGE (TACNIJE TO BI TREBAL ODA RADI GOOGLE CCLOUD BUILD)

I APPLY-OVACE SE INGRESS CONFIG I DEPLOYMENT ZA AUTH, UPRAVO NA MOJ GOOGLE CLOUD CLUSTER

EXECUTE-UJEM SLEDECE, IN ROOT PROJECT DIRECTORY 

- `skaffold dev`

**MEDJUTIM DOSLO JE DO PROBLEMA**

IMAO SAM DAKLE NEKOLIKO GRESAKA, OD KOJIH SU NEKE IZAZVANE, JER SAM KORISTIO POGRESNU VERZIJU API U YAML CONFIG FILE-OVIMA

DOK JE DRUGA GRESKA NASTALA ZBOG AUTH-A

# DA RESIM PRVO AUTH ERROR ZA `gcloud`

POTREBNO JE LOG-OVATI SE NA SLEDECI NACIN DA BI SE, FILL-OVALI DEFAULT CREDENTIALS

- `gcloud auth application-default login`

DAKLE SKAFFOLD JE CREDENTIALS IZVLACIO IZ NEKOG DEFAULT FILE-A, A ONO PRIJAVLJIVANJE NA AGOOGLE CLOUD TO NIJE OMOGUCILO (`gcloud auth login`)

OVO NOVO PRIJAVLJIVANJE JE KORISTILO [GOOGLE AUTH LIBRARY](https://www.npmjs.com/package/google-auth-library)

# DA RESIM PROBLEM, KOJI SE TICAO UPOTREBE POGRESNOG `apiVersion`-A U YAML CONFIG FILE-OVIMA

- `code infra/k8s/ingress-srv.yaml`

OVDE SAM KORISTIO POGRESAN API; NIJE FUNKCIONISALO SA `networking.k8s.io/v1` VEC JE TREBALO DA REFERENCE-UJEM `networking.k8s.io/v1beta1` (DAKLE SA BETA NASTAVKOM)

```yaml
# EVO OVO MENJAM
# apiVersion: networking.k8s.io/v1
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
            # I ZATO MORAM MENJATI I SINTAKSU KOJA JE OVDE
              # service:
              #   name: auth-srv
              #   port:
              #     number: 3000
            # MORAM OVAKO PISATI
              serviceName: auth-srv
              servicePort: 3000  
```

MOZDA JE OVO GORE BILO PROBLEMATICNO ZBOG VERZIJE KUBERNETES CLUSTERA, JER SECAM SE DA JE U REGIONU KOJI SAM IZABRAO BILE DOSTUPNE VERZIJE CLUSTERA, KOJE SU BILE LOWER OD ONE VERZIJE KOJU KORISTI minikube KADA SAM GA KORISTIO NA MOM RACUNARU; A MOZDA OVO I NEMA VEZE SA CLUSTEROM, SVE U SVEMU MORAO SAM DA DOWNGRADE-UJEM

**SLEDECI ERROR SE ODNOSIO NA TO DA KORISTIM API VERZIJU ZA SKAFFOLD KOJA NIJE PREPOZNATA**

ZATO SAM ODLUCIO I TO DA DOWNGRADE-UJEM, NA PRVU VERZIJU, KOJA JE ISPOD TRENUTNE

- `code skaffold.yaml`

```yaml
# UMESTO OVO
# apiVersion: skaffold/v2beta13
# OVO
apiVersion: skaffold/v2beta12
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  googleCloudBuild:
    projectId: microticket
  artifacts:
    - image: us.gcr.io/microticket/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .

```

***
***

URADIO SAM OVO ALI MISLIM DA JE BILO SUVISNO, INSTALIRAO SAM SKAFFOLD KORISCENJEM `gcloud components install`

SADA IMAM DUPLE VERZIJE skaffold-A, JEDNU NA MOM RACUNARU, A DRUGU KAO DEO GOOGLE CLOUD SDK-A NA MOM RACUNARU

**ISTI JE SLUCAJ I SA `kubectl`**

ZATO SADA MISLIM DA JA NISAM TREBAO INSTALIRATI NI skaffold ALI NI kubectl PREKO `gcloud components install`

ZA SADA NEMAM S OVIM PROBLEMA, ALI NE ZNAM DA LI CU IH IMATI U BUDUCNOSTI

SVE U SVEMU TREBALO BI DA SE UKLONE POMENUTE STVARI; ONE INSTALIRANE RANIJE, ILI OVE INSTALIRANE SADA SA POMENUTOM KOMANDOM

***
***

# SADA SAM POKRENUO `skaffold dev` I SVE JE FUNKCIONISALO

- `skaffold dev`

I SADA DA TI NE PRICAM OPET STA JE SVE SKAFFOLD URADIO, U KOMUNIKACIJI SA GOOGLE CLOUD BUILD-OM

UGLAVNOM TVOJ JEDAN JEDINI MICROSERVICE JE DEPLOYED, INSIDE POD INSIDE DEPLOYMENT INSIDE NODE NA GOOGLE CLOUD-U

EVO, TESTIRACU TAJ ENDPOINT

- `http microticket.com/api/users/currentuser`

```zsh
TTP/1.1 200 OK
Connection: keep-alive
Content-Length: 32
Content-Type: text/html; charset=utf-8
Date: Sun, 28 Mar 2021 10:53:56 GMT
ETag: W/"20-Snf9C1Kawnpxc1TswxEK6VQitMc"
X-Powered-By: Express

Hello there, my name is Stavros.

```

## TI BI TREBALO DA VIDIS LOGS I U SEKCIJI `Cloud Build`-A

OTVORI HAMBURGER I ONAJ `Cloud Build` I SADA OTVORI `History` DEO

VIDECES ODMAH JEDAN LOGS ENTRY, KLIKNI NA NJEGA

VIDECES BUILD LOGS I TU CES PREPOZNATI TO DA JE DOCKER DAEMON BIO POKRENUT NA CLOUDU DA BUILD-UJE IMAGE (SVE OD INSTLACIJA, PA DO POKRETANJE STARTUP KOMANDE)

**IMAGE JE ONDA PUSHED TO GOOGLE CLOUD REPOSITORY OF IMAGES** (TO MOZES VIDETI IZ TIH LOGS)

DAKLE VISE SE NE KORISTI DOCKER HUB

## DALJE MOZES VIDETI, NA SVOJOJ LOKALNOJ MACHINE-I, ONE LOGSE SKAFFOLD-A

DAKLE SKAFFOLD JE NAPRAVIO DEPLOYMENT, ZATIM JEDAN CLUSTER IP SERVICE (STO JE DEFINISANO ZA JEDAN ONAJ JEDINI MICROSERVICE KOJ IZA SADA IMAM)

ISTO TAKO MOGU VIDETI DA JE INGRESS SERVICE CREATED
