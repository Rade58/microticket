# PORT FORWARDING WITH `kubectl`

DAKLE JA ZELIM DA, ZA POTREBE POMENUTE TEST APLIKACIJE, KOJU CU RUNN-OVATI NA MOJOJ LOCAL MACHINE-I, EXPOSE-UJEM NATS STREAMING SERVER, KOJI JE U MOM KUBERNETES CLUSTERU, ALI NE ZELIM DA ZA TO KORISTIM NI `NODE PORT SERVICE`, A NI `CLUSTER IP SERVICE` (PRVENSTVANO JER RADIM OVAJ SUBPROJECT I NE ZELIM DA PISEM NOVE KUBERNETES KONFIGURACIJE U MOM MAIN PROJECT-U)

# MOGU KORISTITI KOMANDU, KOJA CE RECI KUBERNETES CLUSTERU TO `PORT FORWARD` SPECIFIED POD IN OUR CLUSTER

**USTVARI, KADA KORISTIM OVAJ PORT FORWARDING THING TO CE PROUZROKOVATI PONASANJE U NASEM CLUSTER, KAO DA SE STVARNO RUNN-UJE NODE PORT SERVICE**

POD NATS STREAMING SERVERA CE TADA BITI EXPOSSED, ODNOSNO NJEGO ODREDJENI PORT, TO THE OUTSIDE WORLSS (WORL PTSIDE OF THE CLUSTER)
