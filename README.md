# CLIENT HEALTH CHECKS

DA TI PRVO PREDSTAVIM JEDAN PROBLEM 

DA TE PODSETIM

DAKLE IMAM DVA NASA SUBSCRIPTION, KOJA SU ACTIVE I ZA KOJE SAM DEFINISAO QUEUE GROUP, I ZA KOJE MORAM MANUELNO DA POTVRDIM AKNOWLEDMENT U message LISTENERU (VRATI SE U PREDHODNE BARANCHEVE AKO TI NIJE JASNO)

IMAM TAKODJE PUBLISHERA KOJI JE ACTIVE I KOJI SALJE MESSAGE ODMAH NAKON STO SE RUNN-UJE `publisher.ts` (PROSTO RECENO HARCODE-OVAO SAM T JSENDING DA MORA EXECUTABLE DA SE RESTARTUJE DA BI SE PUBLISH-OVAO EVENT) (VRATI SE U PREDHODNE BARANCHEVE AKO TI NIJE JASNO)

**UGASICU NAKRATTKO OBA LISTENERA**

SADA NEMA NIKOG DA LISTEN-UJE


ALI HAJDE DA BRZOM BRZINOM VRATIMO SADA ODMAH LISTENERE, DA IH OPET POKRENEMO

I ODMAH POSLE TOGA BRZOM BRZINOM

**RESTARTOVACU PUBLISHER SCRIPT DA BI OPET DOSLO DO PUBLISHINGA EVENTA**

PROBLEM JE U TOME STO NEKADA

**`TAJ EVENT NECE BITI PROSLEDJEN DO LISTENERA`**

SADA MOZES OPET DA RESTARTUJES PUBLISHERA ODNOSNO DA PUBLISH-UJES EVENT

DATA CE SE ODMAH STMAPTI U JEEDNOM OD LISTENER TERMINALA STO ZNACI DA JE ON TAJ EVENT USPESNO POSLAT

**ALI NAKON NEKOLIK ODESETINA SEKUNDI, JEDAN TERMINAL JEDNOG LISTENERA CE STAMPATI KAO REZULTAT ONOGG EVENT KOJI JE POSLAT KADA U SVI LISTENERI BILI DOWN**

STO ZNACI DA SE EVENT SA VECIM REDNIM BROJEM REGISTROVAO PRE ONOGA SA MANJIM REDNIM BROJEM

# DA BI VIDEO ZASTO SE OVO DESAVA TI MORS MALO DA DIGG-UJES INSIDE NATS STREAMING SERVER

KADA SA NATS STREAMING SERVER INSTATICIZIRAO U POD U TVOM CLUSTERU, TI SI ZA NJEGA ZADAO DVA PORTA

EVO POGLEDAJ

- `cat infra/k8s/nats-depl.yaml`

```yaml
# ...
# OVO TI JE DDEO KONFIGURACIJE ZA CLUSTER IP
spec:
  selector:
    app: nats
  ports:
    # DODAO SI JEDAN PORT
    # TO JE PORT KOJ ISI EXPOSE-OVAO DA BI MOGAO
    # DA SE KONEKTUJES SA CLIENTIMA KOJI SU NA MOM LOKALNOM RACUNARU
    - name: client
      protocol: TCP
      port: 4222
      targetPort: 4222
      # ALI TU JE I DRUGI PORT, A KO STO VIDIS DAO SI MU IIME
      # MONITORING
    - name: monitoring
      protocol: TCP
      port: 8222

```


