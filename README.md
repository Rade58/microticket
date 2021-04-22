# PORT FORWARDING WITH `kubectl`

DAKLE JA ZELIM DA, ZA POTREBE POMENUTE TEST APLIKACIJE, KOJU CU RUNN-OVATI NA MOJOJ LOCAL MACHINE-I, EXPOSE-UJEM NATS STREAMING SERVER, KOJI JE U MOM KUBERNETES CLUSTERU, ALI NE ZELIM DA ZA TO KORISTIM NI `NODE PORT SERVICE`, A NI `CLUSTER IP SERVICE` (PRVENSTVANO JER RADIM OVAJ SUBPROJECT I NE ZELIM DA PISEM NOVE KUBERNETES KONFIGURACIJE U MOM MAIN PROJECT-U)

# MOGU KORISTITI KOMANDU, KOJA CE RECI KUBERNETES CLUSTERU TO `PORT FORWARD` SPECIFIED POD IN OUR CLUSTER

**USTVARI, KADA KORISTIM OVAJ PORT FORWARDING THING TO CE PROUZROKOVATI PONASANJE U NASEM CLUSTER, KAO DA SE STVARNO RUNN-UJE NODE PORT SERVICE**

POD NATS STREAMING SERVERA CE TADA BITI EXPOSSED, ODNOSNO NJEGO ODREDJENI PORT, TO THE OUTSIDE WORLSS (WORL PTSIDE OF THE CLUSTER)

DA VIDIM LISTU ALL OF MY RUNNING PODS

- `kubectl get pods`

```sh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          4h29m
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          4h29m
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          4h29m
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          4h29m
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          4h29m
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          4h29m

```

ZANIMA ME DAKLE OVAJ POD: `nats-depl-f878fb4f9-k6fgq`

# `kubectl` KOMANDA KOJU CU KORISTITI JESTE `port-forward`

`kubectl port-forward <ime pod-a> <port na lokalnoj machine-i>:<port poda koji zelis da expose-ujes>`

SADA CU RUNN-OVATI, POMENUTU KOMANDU

- `kubectl port-forward nats-depl-f878fb4f9-k6fgq 4222:4222`

OVA STVAR RUNN-UJE, DAKLE TERMINL HANG-UJE

**NEMOJ DA PRITISKAS `CTRL + C` JER CE SE ONDA PREKINUTI PORT FORWARDING**

## SDA OTVORI NOVI TERMINAL I POKRENI ONAS PUBLISHING SCRIPT

- `cd nats_test_project`

(ne nemoj ovo, `yarn publish` ovo je za publis paketa)

- `yarn run publish`

EVO KAKV JE OUTPUT (TAKODJE I OVAJ TERMINAL HANG-UJE STO ZNACI DA JE KONEKCIJA OTVARENA I DA ZIVI)

```sh
[INFO] 18:49:12 ts-node-dev ver. 1.1.6 (using ts-node ver. 9.1.1, typescript ver. 4.2.4)
Publisher connected to NATS
```
