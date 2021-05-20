# MANUAL SECRET CREATION FOR OUR CLUSTER ON DIGITAL OCEAN

KOJE K8s SECRETS OBJECTS TREBAS DA NAPRAVIS, I KOJE KLJUCEVE U NJIMA DA PODESIS, MOZES NACI INSIDE `infra/k8s-prod/payments-depl.yaml`, JER ON JE BAS REPREZENTATIVAN U TOM POGLEDU

- `cat infra/k8s-prod/payments-depl.yaml`

U SUSTINI TREBALO BI NAPRAVITI `stripe-secret` K8S SECRET OBJECT, A U NJEMU KEY `STRIPE_KEY`, KOJEM CES ZADTI VREDNOST ONOG SECRET STRIPE KEY-A, KOJEG CES OBTAIN-OVATI U STRIPE DASBOARD-U (LEVI MENU `Developers -> API`)

I TREBA TI `jwt-secret` K8S SECRET OBJECT, A UNJEMU KEY `JWT_KEY`, KOJEM MOZES ZADATI STA GOD HOCES KAO VREDNOST

SECRET OBJECTS CEMO NARAVNO KREIRATI FROM COMMAND LINE NA NASOJ LOKLANOJ MACHINE,I, JER TO MOZEMO, JER SADA IMAMI ZA `kubectl`, UPRAVO CONTEXT, ONOG NASEG CLUSTERA NA DIGITAL OCEAN-U, JER SMO TAKO PODESILI

ALI HAJDE DA PROVERIMO DA LI IMAMO TAJ CONTEXT

- `kubectl config get-contexts`

```zsh
CURRENT   NAME                                             CLUSTER                                          AUTHINFO                                         NAMESPACE
*         do-fra1-microticket                              do-fra1-microticket                              do-fra1-microticket-admin                        
          gke_microticket_europe-west2-b_microticket-dev   gke_microticket_europe-west2-b_microticket-dev   gke_microticket_europe-west2-b_microticket-dev 
```

A MOZES TO VIDETI I KROZ `kubectl config view` (ALI OVO GORE JE NEKAKO BOLJA KOMANDA, A ONO STA MI TREBA)

A CISTO DA TE PODSETIM, DA SWITCH-UJES CONTEXT, STO MI SADA NE MORAMO RADITI, KORISTI:

`kubectl config use-context <context name>`

## DA KREIRAMO SECRETS

- `kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<your stripe secret key>`

- `kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<your jwt secret>`

- `kubectl get secrets`

```zsh
NAME                  TYPE                                  DATA   AGE
default-token-mwdnw   kubernetes.io/service-account-token   3      26h
jwt-secret            Opaque                                1      27s
stripe-secret         Opaque                                1      118s
```
