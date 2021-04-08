# INSTALLING DEPENDANCIES FOR TESTING

- `cd auth`

- `yarn add jest supertest ts-jest mongodb-memory-server @types/supertest --dev`


NAJDUZE CES CEKATI INSTALACIJU ZBOG mongodb-memory-server, JER JE U PITANJU LARGE PACKAGE

TO JE U SUSTINI, TESKAA 8OMB, KOPIJA MONGODB-JA

ONA JE KOPIJA KOJU CE TEST POKRENUTI DA RUNN-UJE IN MEMORY

**IN MEMORY JE DA BI MOGAO DA TESTIRAS MULTIPLE DATBASES AT THE SAME TIME**

DAKLE TU JE DA BIH MOGAO TESTIRATI EASYLLY VISE MICROSERVICE-A

# MEDJUTIM, RKAO SAM DA TESTIRAM LOKALNO, I DA MI NE TREBAJU MULTIPLE VIRTUAL MACHINES, STO ZNACI DA NECU KORISTITI MOJ CLUSTER; PA ZATO OVI GORNJI DEPENDANCIES NE TREBAJU DA BUDU DEO DOCKER CONTAINERA; `ZATO SAM IH INSTALIRAO KAO DEVELOPMENT DEPENDANCIES`

**ZATO TREBAS MODIFIKOVATI `Dockerfile`, KAKO BI AVOID-OVAO IMAGE REBUILDS, ZBOG POMENUTIH DEV DEPENDANCIES-A**

- `code auth/Dockerfile`

DAKLE U SLUCJU INSTALIRANJA MODULA, DODACU FLAG `--only=prod`

```dockerfile
FROM node:lts-alpine3.12

WORKDIR /app

COPY ./package.json ./
# DODAO OVDE
RUN npm install --only=prod

COPY ./ ./

CMD ["npm", "start"]

```

SADA KADA DEVELOP-UJES U CLUSTERU, NECES MORATI DA CEKAS NA INSTALIRANJE POMENUTIH MODULA, POGOTOVO IN MEMORY MONGO DATBASE-A, KOJI IMA 80MB
