# SECURELY STORING SECRETS WITH KUBERNETES

KAKO SAM DISKUTOVAO U PREDHODNOM VIDEO-U, MORAM NEKAKO DA OSIGURAM **SECRET SIGNING KEY** ,SA KOJIM PRAVIM WEB TOKE; ALI MORAM FIGURE-OVATI KAK OTO DA RADIM U KEBERNETES ARITEKTURE, JER JA IMAM/IMACU MNOSTVO POD-OVA U KOJIMA SU CONTAINARIZ-OVANI RAZLICITI MICROSERVICE-OVI

**JA CU TO URADITI, KOISCENJM FEATURE-A INSIDE KUBERNETES, KOJI JE SPECIJALNO DIZAJNIRAN ZA SHARING INFORMACIJA U RAZLICITIM PIECE-OVIMA, MOJE APLIKACIJE**

DA JOS JEDNOM RAZMOTRIM ARHITEKTURU, DAKLE INSIDE ONE KUBERNETES NODE JA IMAM/IMACU POD-OVE, OD KOJIH SVAKI IMA PO CONTAINER

IMACU CONTINER ZA orders MICROSERVICE, ZA payments MICROSERVICE, A CONTAINER ZA auth MICROSERVICE VEC IMAM

SVI TI CONTAINERI TREBAJU ONAJ JWT SECRET SIGNING KEY

# OVO ZNACI DA CU KRIRATI UNIQUE KIND OF OBJECT IN MY CLUSTER ;A TAJ OBJECT SE ZOVE `Secret`

SECAS SE DA OBJEKTIMA NAZIVAMO SVE STO KREIRAMO U KUBERNETES-U; PO JE OBJEKAT, DEPLOYMENT JE OBBJEKAT, SERVICE JE OBJEKAT

POSTOJI I `Secret` OBJEKAT

**INSIDE THIS OBJECT WE CAN STORE LITTLE KEY-VALUE PAIRS OF INFORMATION**

KADAA KREIRAS SECRETS, MOZES IH LOAD-OVATI U CONTAINERS IN ALL OF OUR DIFFERENT PODS

## SECRET CE U NASIM CONTAINERIMA BITI EXPOSED KAO ENVIROMENT VARIABLE

NA TAJ NACIN TE SECRETS BITI EASYLY AVAILABLLE KAO ENV VARIABLE INSIDE OUR EXPRESS APPLICATIONS

# SADA CU KREIRATI KUBERNETES OBJECT `Secret`, I SECRET CE BITI `generic` TIPA, NAMENJENO ZA STORING AN ALL PURPOSE SECET INFORMATIONS

TO TI GOVORIM JER POSTOJI I DRUGCIJ I SECRET, ZA STRING SECRET FOR ACCESSING REPOSITORY OF SECRET IMAGES

OVAKO SE KREIRA SECRET OBJECT; EXECUTINGOM SLEDECE KOMANDE

- `kubectl create secret generic <ime objekta> --from-literal=<key>=<value>`

MOZES OVAKO ZADATI MANY DIFFERENT KEY VALUE PAIRS

FROM LITERAL ZNACI DA CES IH ZADAVATI OVAKO KROZ KOMANDU, A NECES IH UZIMATI IZ FILE-A (JER POSTOJI I --from-file FLAG)

**POMENUTA KOMNDA JE IMPERATIVE COMMAND U KUBERNETES-U; A TO ZNACI DA JE TO KOMANDA SA KOJOM KREIRAMO ACTUAL OBJECTS**

JA RANIJE NISAM KORISTIO IMPERATIVE APPROACH, VEC SAM KORISTIO DECLARATIVE APPROACH, GDE SA SVAKI KUBERNETES OBJEKAT, USTVARI DEFINISAO CONFIG FILES, KOJE SAM APPLY-OVAO NA MOJ CLUSTER

**NEMAM CONFIG FILE, JER BI MORAO U NJEMU DA LIST-UJEM SECRET KEY VALUE PAIRS ,A ZA TO NEMAM PPOTREBE**

PROBLEM JE JEDINO STO MORAS DA RMEMBER-UJES SECRETS KOJE SI KREIRAO OVER TIME, KADA SPIN-UJES UP NEW CLUSTER

ZATO MOZDA MOZES SAMO DA OZNACIS KLJUCEVE U NEKOM .txt FILE-U; ALI I DA STORE-UJES IMA SECRET OBJECT-A (JA SAM NAPRAVIO OVAJ `secrets.txt`) (NARAVNO OVO BI TREBAAO UKLONITI U PRODUCTION-U)

# JA CU SADA DA POKRENEM KOMANDU ZA KRIRANJE SECRET OBJECT-A, A DEFINISACU DAKLE I JEDAN SECRET

- `kubectl create secret generic jwt-secret --from-literal=jwt=stavros`

```zsh
secret/jwt-secret created
```

PROVERAVAM DA LI JE NAPRAVLJEN SECRETS OBJEKAT

- `kubectl get secrets`

```zsh
NAME                  TYPE                                  DATA   AGE
default-token-f4zjf   kubernetes.io/service-account-token   3      9d
jwt-secret            Opaque                                1      15s
```

KAO STO VIDIS KREIRAO SAM SECRETS OBJEKAT

DA PROBAM DA VIDIM STA KAKAV CU OUTPUT IMATI KADA GA DESCRIBE-UJEM

- `kubectl describe secret jwt-secret`

```zsh
Name:         jwt-secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
jwt:  7 bytes
```

KAO STO VIDIS UNDER Data JE PRIKAZAN KEY `jwt` KOJEG SAM ZADAO, I NAPISANO JE DA IMA 7 bytes
