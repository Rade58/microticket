# DON'T FORGET TO INSTALL INGRESS-NGINX, FOR YOUR K8S CLUSTER ON DIGITAL OCEAN

SECAS SE DA SMO TO RADILI I ZA NAS DEVELOPMENT CLUSTER; A NAS DEVELOPMENT CLUSTER JE DEPLOYED NA GOOGLE CLOUD-U, I MI SMO MORALI DA RUNN-UJEMO SPECIFICNU KOMANDU, U ZAVISNOSTI KOJI JE PROVIDER CLUSTERA, A U SLUCAJU DEVELOPMENTA TO JE BIO GOOGLE CLOUD KAO PROVIDER

**SADA MI TREBA KOMANDA ZA INSTALACIJU INGRESS KONTROLERA, KOJA ODGOVARA TOME DA JE NAS CLUSTER DEPLOYED NA DIGITAL OCEAN-U**

[TAKVU KOMANDU SAM NASAO OVDE U DOKUMENTACIJI](https://kubernetes.github.io/ingress-nginx/deploy/#digital-ocean)

DA OPET PROVERIM IMAM LI PRAVI CLUSTER CONTEXT

- `kubectl config get-contexts`

VIDEO SAM DA IMAM (A DA NISI IMAO PROMENIO BI CONTEXT NA `kubectl config use-context <context name>`)

PA CU SADA DA RUNN-UJEM SLEDECU KOMANDU, PREKOPIRANU SA GORNJEG LINKA

- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.46.0/deploy/static/provider/do/deploy.yaml`

## ALI MI MORAMO URADITI JOS JEDAN QUICK THING, A TO JE DA COMMIT-UJEMO NASE CHANGES, KOJE SMO NAPRAVILI SA SVIM NASIM K8S MANIFEST FILE-OVIMA

ODNONO MI SMO IH, AKO SE SECAS PODELILI U RAZLICITE FOLDERE, DA BI NEGDE SPECIFICIRALI RALICITE IMAGE-OVE, SVOJSTVENE ZA PRODUCTION

A TAKODJE SMO NA SAMOM GITHUB-U DEFINISALI WORKFLOW, KOJI SVE TE CONFIGURACIJE TREBA DA APPLY-UJE NA CLUSTER

**PRECI CEMO U DEV BRANCH, JER SMO TAKO I RANIJE RADILI (NECU DA POKUSAM PRAVLJANJE NI JEDNOG PULL REQUESTA STO SE TICE BRANCH-EVA, KOJE MI SLUZE ZA BELEZENJE OVOG WORKSHOPA-A)**

UGLAVNOM, PREBACIO SAM SE U `dev` BRANCH, I U NJEGA MERGE-OVAO SVE PROMENE KOJE SAM NAPRAVIO `git merge <odredjeni branch u kojem sm bio>`

**SADA CEMO DA PULL-UJEMO PROMENE IZ MAIN-A, JER SMO AKO SE SECAS I TAMO PRAVILI SVE PROENE ZA WORKFLOWS, KOJE NEMAMOM**

- `git pull origin main`

E SADA DA COMMIT-UJEMO SVE PROMENE KOJE SMO PRAVILI LOKALNO

- `git add -A`

- `git commit -am 'k8s manifests are ready'`

PUSH-UJEM SVE DO DEV REMOTE-A

- `git push origin dev`

**IDEMO NA GITHUB DA NAPRAVIMO PULL REQUEST ZA MERGING dev-A INTO `main`** (IDEMO U `Pull requests` TAB GDE BRAVIMO NOVI PULL REQUEST, I RADIM SVE PO REDU STO SAM VEC I RANIJE RADIO)

SADA KADA KREIRAS PULL REQUES NECE SE OBAVITI NI JEDAN TETING WORKFLOW, JER NISMO NISTA MNJALI U MICROSERVICE-OVIMA

**MOZEMO DA KLIKNEMO NA `Merge pull request`**

***

digresija: mozda se ovo iz digresije nece dogoditi jer nismo nista promenili u individual microservice-ovima

POSTO IMAMO `.github/workflows/deploy-auth.yml` WORKFLOW, KOJI DEFINISE ACTION KOJI SE POKRECE ON PUSH TO `main` A MERGING PULL REQUESTA TO MAIN SE RACUNA KAO push TO main

DESICE SE BUILDING IMAGE I NJEGOV PUSHING TO DOCKER HUB, STO SMO VEC I RANIJE URADILI I ZNAMO DA CE SE DESITI

**ZAISTA NECE JER NISMO NISTA PROMENILI U CODEBASE-U auth MICROSERVICE-A**

***

**DESICE SE I APPLYIG SVIH POTREBNIH MANIFEST FILE-OVA NA NAS CLUSTER U DIGITAL OCEAN-U, JER JE `.github/workflows/deploy-manifests.yml` TAJ KKOJI SE ISTO RUNN-UJE ON push TO MAIN BRANCH**

MOZES PRACI U `Actions` TAB I VIDETI DA SE `deploy-manifests.yml` IZVRSAVA I DA SE USPESNO SVE IZVRSILO, JER IMAM ZELENI CHECKMARK, A MOGAO SI KLIKNUTI DA `build` (LEVO) DA VIDIS SVE LOGS I SVE STA SE IZVRSAVALO

UGLAVNOM BILO JE SVE USPESNO

# KONACNO MOGU PROVERITI DA LI IMAM ,SVE DEPLOYMENTS, ODNOSNO DA LI IMAM RUNNING PODS NA MOM CLUSTER-U NA DIGITAL OCEAN-U

- `kubectl get deployments`

KAO STO VIDIS NISU SVE DEPLOYMENTS AVAILABLE, RECI CU TI UBRZO I ZASTO

```zsh
NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
auth-depl               1/1     1            1           12m
auth-mongo-depl         1/1     1            1           12m
client-depl             0/1     1            0           12m
expiration-depl         0/1     1            0           12m
expiration-redis-depl   1/1     1            1           12m
nats-depl               1/1     1            1           12m
orders-depl             0/1     1            0           12m
orders-mongo-depl       1/1     1            1           12m
payments-depl           0/1     1            0           12m
payments-mongo-depl     1/1     1            1           12m
tickets-depl            0/1     1            0           12m
tickets-mongo-depl      1/1     1            1           12m
```

- `kubectl get pods`

```zsh
NAME                                     READY   STATUS             RESTARTS   AGE
auth-depl-77f5647f8d-9x5kz               1/1     Running            0          4m33s
auth-mongo-depl-6b6f97556-hlncf          1/1     Running            0          4m43s
client-depl-78f896bbd7-bhvfq             0/1     ImagePullBackOff   0          4m42s
expiration-depl-6647cb94c9-6z5x4         0/1     ImagePullBackOff   0          4m32s
expiration-redis-depl-55c656669f-fc6wv   1/1     Running            0          4m40s
nats-depl-68b7d794b4-hr85z               1/1     Running            0          4m39s
orders-depl-6cb94b74bd-l8lxp             0/1     ImagePullBackOff   0          4m30s
orders-mongo-depl-6b554544d8-ff25q       1/1     Running            0          4m38s
payments-depl-5b8f8f8694-z8rcw           0/1     ImagePullBackOff   0          4m29s
payments-mongo-depl-76ffcb78fb-52tsb     1/1     Running            0          4m36s
tickets-depl-69c8d8689b-wjbdn            0/1     ImagePullBackOff   0          4m28s
tickets-mongo-depl-8546d98f5b-zn2kb      1/1     Running            0          4m35s
```

KAO STO VIDIS SVI PODS VEZANI ZA MONGO INSTANCE SU READY ,KAO I ZA JEDINU REDIS INSTANCU

ZATIM READY JE POD ZA `auth-depl`, **ALI NISU ZA ONE OSTALE MICROSERVICE-OVE, JER KAO STO SMO URADILI ZA auth, KREIRAJUCI `.github/workflows/deploy-auth.yml`; TO NISMO URADIL IZA OSTALE MICROSERVICE-OVE** (STO ZNACI DA ZA OSTALE PODS, NISMO OBEZBEDILI IMAGE-OVE UOPSTE) (TO CEMO POPRAVITI VRLO BRZO)

ZATO NAM NISU SVE DEPLOYMENTS AVAILABLE I SVI PODOVI NAM NISU READY

# DA VIDIMO RADI LI NAM I INGRESS CONTROLER

- `kubectl describe ingress`

```zsh
Name:             ingress-srv
Namespace:        default
Address:          174.138.103.157
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
Rules:
  Host             Path  Backends
  ----             ----  --------
  microticket.com  
                   /api/users/?(.*)      auth-srv:3000 (10.244.0.254:3000)
                   /api/tickets/?(.*)    tickets-srv:3000 ()
                   /api/orders/?(.*)     orders-srv:3000 ()
                   /api/payments/?(.*)   payments-srv:3000 ()
                   /?(.*)                client-srv:3000 ()
Annotations:       kubernetes.io/ingress.class: nginx
                   nginx.ingress.kubernetes.io/use-regex: true
Events:
  Type    Reason  Age                From                      Message
  ----    ------  ----               ----                      -------
  Normal  Sync    14m (x2 over 15m)  nginx-ingress-controller  Scheduled for sync

```
