# MANUAL TESTING WITH INSOMNIA

IAKO SAM JA TOKOM KREIRANJA tickets MICROSERVICE-A, KORISTIO TAKOZVANI TEST-FIRST APPROACH, DOBRO JE NAPAVITI I MANUELNI TEST

## MEDJUTIM MI JOS NISMO U INGRESS NGINX KONFIGURACIJI SPECICIRALICLUSTER CLUSTER IP SERVICE, ZA tickets MICROSERVICE

TAKO DA CU TO SADA URADITI

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   7d23h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    7d23h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    7d23h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     25d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   2d21h
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    2d21h
```

DAKLE TAJ CLUSTER IP SERVICE JESTE tickets-srv

- `code infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          # DODAO SAM OVO I TO NA OVOM MESTU
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

**DA SUPER IMPORTANT JE DA SMO TAMO UMETNULI GORNJU KONFIGURACIJU (PRE SPECIFIKACIJE ZA client POSTO ON IMA THE CATCH ALL ROUTES (`?(.*)`)); JER DA JE client-srv-OV CATCH ALL ROUTES BILO NA POCETKU, INGRESS NGINX BI SVE REQUEST PROSLEDIO TOM SERVICE-U**

DAKLE KADA DO INGRESS NGINX DA ODJE REQUEST PREMA SPECIFICIRANOM PATH-U, ON CE BITI FORWARDED DO NASEG tickets MICROSERVICE-A

ALI SADA TI MORAS DA APPLY-UJES CHANGES NA NASEM CLUSTERU NA GOOGLE CLOUD-U

TO RADIM POKRETANJEM SKAFFOLD-A

- `skaffold dev`

SADA KADA JE SKAFFOLD ODRADIO SVOJE, MOZES POCETI SA MANUELNIM TESTIRANJEM `tickets` MICROSERVICE-A

# DAKLE TESTIRAMO SA INSOMNIOM

ALI PAR STVARI KOJE MORAMO ZNATI; SAMO TE PODSECAM NA NJIH

POSTO KORISTIMO "FAKE" HTTPS, TAKORECI, MORAMO DA UNCHECK-UJEMO `Validate Certificates` OPCIJU U SETTINGSIMA INSOMMNIE

MORAMO PRVO NAPRAVITI NOVOG USER-A DA BI IMALI COOKIE (NE BRINI DALJE O COOKIE-U VODI RACUNA INSOMNIA, ONA CE GA UVRSTITI U SVAKI FOLLOWUP REQUEST)

A COOKIE NAM MORA BITI PROVIDED JER JE KREIRANJE I UPDATING TICKETA IZISKUJU DA USER-A MORA BITI
