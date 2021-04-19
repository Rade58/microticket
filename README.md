# ADDING AUTH PTECTION





***


JOS UVEK NISI NISI `CLUSTER IP SERVICE` ZA tickets, POVEZAO SA `INGRESS NGINX`-OM


***

HAJDE PRVO TO DA URADIM

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   5d18h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    5d18h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    5d18h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     22d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   16h
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    16h

```

ZANIMA ME DAKLE POSLEDNJI I NJEG CU DA PODESIM U INGRESS CONFIG-U

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
          # -------------------------------
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

SADA SAM BAR SIGURAN DA CE INGRESS ROUTE-OVATI REQUEST DO APPROPRIATE EXPRESS APP-A

