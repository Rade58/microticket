# `kubectl` CONTEXT

KADA BI NA LOKALNOJ MACHINI, ODNOSNO TVOM RACUNARU, POD USLOVOM DA TI JE minikube STARTOVAN (MENI SADA NIJE JER NE PLANIRAM DA GA KORISTIM), KUCAO `kubectl get pods` BILI BI TI LISTED PODS

**ALI KAKO JA DA SE KONEKTUJEM NA CLUSTER KOJ ISAM KREIRAO NA GOOGLE CLOUD PLATFORMI**?

ZA ACCESSING CLUSTER-A, KORISTICES UVEK KOMANDU `kubectl`; MEDJUTIM U SLUCAJU DA IMAS VISE CLUSTERA, NA KOJI CLUSTER ,CE SE POMENUTA KOMANDA PRIMENITI?

# E PA TU NA SCENU STUPA CONTEXT `kubectl`-A

MOZES GA SMATRATI RAZLICITIM CONNECTION SETTINGSIMA

TU SU AUTHORIZATION CREDENTIALS, SOME USERS IP ADRESSES, MNOGO RAZLICITIH INFORMACIJA, KOJA GOVORE `kubectl`-U, KAKO DA SE KONEKTUJE TO DIFFERENT CLUSTER, KOJI POSTOJI IN THE WORLD

**NA SVOM RACUNARU TI SI SADA CONNECTED TO LOACAL CLUSTER, I TO KONEKTOVAN SI ONDA KADA SI INSTLAIRAO DOCKER (NIJE MI JASNO ZASTO DOCKER, KADA JE OVDE REC O KUBERNETESU) (MOZDA SE MISLILO NA minikube)**

# JA MORAM DODATI SECOND CONTEXT, KOJI CE RECI `kubectl`-U, KAKO DA SE KONEKTUJE NA CLUSTER, KOJI SMO KREIRALI NA GOOGLE CLOUD-U

MOGU TO RADITI NA DVA NACINA:

- KORISCENJEM DASHBOARD-A GOOGLE CLOUD-A (PROLAZIMO KROZ SERIJU RAZLICITIH MENU-A ,DA BI NASLI LITTLE CONFIG, KOJI BISMO COPY PASTE-OVALI U FILE NA NASOJ LOKALNOJ MACHINE-I)

- LAKSI NAIN JE **DA INSTALIRAMO TOOL `GOOGLE CLOUD SDK` (SOFTWE DEVELOPMENT KIT)**
