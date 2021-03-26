# IPAK CU PODESITI REGEX U PATH-U

RANIJE SAM REKAO DA CU IMATI OVAKVE PATH-OVE ZA `auth` MICROSERVICE

`/api/users/signup` (POST); body: `{email: string; password: string}` (CREATING ACCOUNT)

`/api/users/signin` (POST); body: `{email: string; password: string}` (SIGNING IN TO EXISTING ACCOUNT)

`/api/users/signout` (POST); body: `{}` (SIGNING OUT)

`/api/users/currentuser` (GET); body: `none` (RETURNS A SINGLE USER DOCUMENT)

**PRIMECUJES LI GORE DA TI PATH-OVI IMAJU ZJEDNICKI DEO, TO JE `/api/users`**

**DINAMICKI DEO DOLAZI POSLE TOGA**

## JA SAM ZATO MOGAO DA KORISTIM REGEX U KONFIGURACIJI INGRESS CONTROLLER-A

- `code `

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    # BITNO DA JE OVO ENABLED
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: microticket.com
      http:
        paths:
          # EVO VIDIS GDE SAM DEFINISAO REGEXP
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000

```

SADA OVA KONFIGURACIJA DOZVOLJAVA MATCHING PRI SLANJU REQUEST-OVA, STO ZNACI DA SAM JA JEDNIM LINE-OM DEFINISAO SVE MOGUCE PATH-OVE, DEFINISUCI REGEX, A NISAM DEFINISAO SVAKI PATH PO NA OSOB

## I SADA BI TREBAL ODA MOZES DA HITT-UJES JEDINI OD ENDPOINTA KOJE IMAS ZA auth MICROSERVICE

- `http GET microticket.com/api/users/currentuser`

```zsh
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 32
Content-Type: text/html; charset=utf-8
Date: Fri, 26 Mar 2021 18:38:31 GMT
ETag: W/"20-Snf9C1Kawnpxc1TswxEK6VQitMc"
X-Powered-By: Express

Hello there, my name is Stavros.
```
