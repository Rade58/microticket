# OTHER DATBASES AND OPTIMISTIC CONCURRENCY CONTROL

OVDE DAKLE GOVORIM O ATBASE-OVIMA, KOJI NISU MONGO

VEROVATNO JE DA ONAJ OPTIMISTIC CONCURRENCY CONTROL NIJE ISTI I U DRUGI MDATBASE-OVIMA

PITANJE JE DA LI GA, UOPSTE IMA OUT OF THE BOX U DRUGIM MICROSERVICE-OVIMA

I PITANJE JE DA LI JE NA ISTI NACIN IMPLEMENTIRAN

**RECIMO U NEKI MDATBASE-OVIMA MOZE VITI DA SE version POVECAVA SA 100 NA 200, SA 200 NA 300 I TK ODALJE**

***

O OVOM PROBLEMU, DRUGIH DATBASE-OVA I CONCURRENCY CONTROL-A, AUTOR WORKSHOP-A GOVORI U VIDEO-U `19-23`

***

**A RESENJE JE DA SE OVAJ OPTIMISTIC CONCURRENCY CONTROL DEFINISE BY YOU**

DAKLE TI TO MOZES DEFINISATI NE VEZANO ZA IMPLEMENTACIJU BILO KOJEG DATBASE-A

**I JA POTPUNO VIDIM KAKO SE TO MOZE IMPLEMENIRATI, A DA NIJE ABSTRACTED U MONGO-U, ALI JA TO NECU URADITI**

## A STO SE TICE SAMOG MONGODB-JA, TI NISI MORAO KORISTITI, UOPSTE ONU OPCIJU `optimisticConcurrency`, VEC SI TO SAM MOGAO DEFINISTI KROZ DVE STVARI ZA KOJE CU TI RECI

ZASTO BI TO URADIO UOPSTE?

**`PA AKO JE version POSLAT I DRUGOG DATBASE-A ,GDE ON IMA DRUACIJ PRAVILA PROMENE, NA PARIMER INCRMENTIRANJE 100 ;A REPLICATED DATA CUVAS U DRUGOM MICROSERVICE-U, INSIDE MONGODB DATABASE`**

MEDJUTIM NECU OVO URADITI, JEDNOSTAVNO MI SE NE SVIDJA, POGLEDAJ OSTATKA VIDE-O 19-23, AKO PLANIRAS NESTO OVAKO DA URADIS


