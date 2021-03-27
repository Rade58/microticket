# SETTING UP LOAD BALANCER AND THE REST

MORAM PODESITI ingress-nginx NA MOM CLUSTER-U NA GOOGLE CLOUD-U

OVO BI TREBALO DA BUDE EASY, A GLEDACU U DOKUMENTACIJU ingress-nginx

U DEPLOYMENT SEKCIJI IMA OBJASNJENJE ZA GOOGLE CLOUD

<https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke>

TO TI JE UNDER `GCE-GKE`

NEMOJ NISTA DA EXECUTE-UJES TA TI JE U OKVIRU INFO-A ILI DANGER ZONE-A, TI EXECUTE-UJES ONU `kubectl apply -f <URL>`

NIJE BITNO GDE OVO EXECUTE-UJES U TERMINALU (TO TI GOVORIM JER SI OVO LOKALNO EXECUTE-OVAO U infra/k8s FOLDERU)

- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/cloud/deploy.yaml`
