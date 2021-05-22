# DIFFERENT IMAGES FOR PRODUCTION CLUSTER, AND DIFFERENT IMAGES FOR DEVELOPMENT CLUSTER

OVO CU SADA POKUSATI DA PODESIM NA OVAKAV NACIN,

DODACU NOVI DOCKERFILE, U SVAKOM OD MICROSERVICE-OVA

TO CE BITI `Dockerfile.prod`


***
***
***
***

# OSTAVLJM TI PODSETNIK

PUBLISHABLE STRIPE KEY SE U client MICROSERVICEU KORISTI KAO ENV VARIANLE (PODESI TO)

baseUrl:
`client/utils/buildApiClient.ts`

TAKODJE SAM PR
IMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***
***
