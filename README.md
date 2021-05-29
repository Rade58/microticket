# BUILDING PREMIUM NEXTJS WEBSITE

OVO NEMA VEZA SA MICROSERVICE-OVIMA KOJE IMAM, ALI CE UCINITI DA BOLJE PRAVIM LANDING PAGES

DAKLE MOJA NEXTJS APLIKACIJA CE IMATI POTPUNO NOVU SEKCIJU PAGE-OVA

PRATIM OVAJ TUTORIJAL

<https://www.youtube.com/watch?v=iGBERMGMIvc>

NARAVNO NECU SE STRIKTNO DRZATI GORNJEG TUTORIJLA, **ZA PAGE-OVE IZ POMENUTOG TUTORIJALA, KORISTICU DRUGE ROUTES, A VEROVATNO CU REWRITE-OVTI MICROTICKET CLIENT SIDE APP, KAKO BI JOJ ZADA O NOVE ROUTE-OVE, ODNONO MISLIM DA CU TO URADITI SAMO ZA INDEX PAGE**

# SADA CEMO ZAMENITI CONTEXT, NASEG CLUSTER-A, JER CEMO SE BAVITI DEVELOPMENTOM

DEVELOPMENT ZELIM DA NASTAVIM NA NASEM DEVELOPMENT CLUSTERU KOJI JE DEPLOYED NA GOOGLE CLOUD-U

- `kubectl config get-contexts`

- `kubectl config use-context <context clustera sa google cloud-a>`

SECAM SE DA SAM POMENUTOM CLUSTER-U SMANJIO BROJ NODE-OVA NA NULA TAKO DA NE BI TROSIO RESURSE

SADA CEMO OPET DA MU VRATIMO NJEGOVA TRI NODE, KAKO BI BIO OPERATIONAL, I KAKOO BISMO MOGLI DA DEVELOP-UJEMO

- `gcloud container clusters list`

- `gcloud container clusters resize <ime clustera sa liste> --num-nodes=3`

# POSTO SMO PROMENILI CONTEXT, SADA SMMO DA START-UJEMO SKAFFOLD

- `skaffold dev`

SADA DAKLE KORISTIMO <https://microticket.com> (KOJI SMO, AKO SE SECAS POVEZALI ZA CLUSTER,ODNOSNO ZA LOADA BALANCER NA GOOGLE CLOUD-U) (TO JE URL SAMO PREKO KOJEG DEVELOP-UJEMO NA NASEM RCUNARU)

- `cat /etc/hosts`

```zsh
# Host addresses
127.0.0.1  localhost
127.0.1.1  eidolon-80r0
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters

# for my kubernetes firts project
# tricking nginx to believe that minikube ip
# is myblog.com

# 192.168.49.2 myblog.com
34.89.40.241 microticket.com # evo ga
```

UGLAVNOM SVE JE UREDNO SERVED

# ALI DOBRO BI BILO DA DESTROY-UJES RESURSE ZA TVOJ PRODUCTION CLUSTER, DA NE BI ZABORAVIO I BIO BILLED, NAKON ISTEKA PROMO PERIODA

UNISTIO SAM I CLUSTER I LOAD BALANCER-A

A ZNAS KAKO OPET SVE DA PODESIS, A ZNAS U KOJIM BRANCH-EVIMA DA POTRAZIS ODGOVOR, AKO TI ZAPNE, KADA OPET BUDES ZELEO DA DEPLOY-UJES PRODUCTION CLUSTER

# SADA CEMO UZETI GOMILU RESURSA, I STAVICEMO IH U NAS CLIENT APP

- `mkdir client/premium`

OVDE SE NALAZE CAK I NEKE KOMPONENTE, ZA KOJE NIJE KORISCEN TYPESCRIPT, KOJE MOGU KASNIJE DA REWRITE-UJEM

U SUSTINI IMACES JAKO MNOGO RESURSA, OD KOJIH NEKKE MOZES KORISTITI RIGHT AWAY, ALI JA CU GLEDATI DA SVE TO REWRITE-UJEM, I POMOGUCSTVO IZMENIM

PA CAK CU GLEDATI DA IZMENIM I IMAGE-OVE, ODNOSNO SVGS

# SADA CEMO DA DEFINISEMO DA NA MAIN PAGE-U POSTOJI SAMO DVA LINKA, OD KOJIH CE JEDAN DA VAODI DO NASE PREMIUM FRONTEND APLIKACIJE, A DRUGA DO MICROTICKETA

MORACEMO DA POPRAVIMO PAR STAVI, PAR LINKOVA U NASEM MICROTICKET APP-U, I DA DEFINISEMO DA SE POSTOJECI HEADER CONDITIONALLY RENDER-UJE (TO ZA HEADER CEMO TO URADITI INSIDE `_app.tsx`)

VIDI I SAM KAKO SAM TO URADIO, NE MORAM DA TI POKAZUJEM
