# INITIALIZING GOOGLE CLOUD SDK

DAKLE U PROSLOM BRANCHU SAM INSTALIRAO GOOGLE CLOUD SDK

IZMEDJU MNOGIH DRUGIH STVARI ON MI MOZE OMOGUCITI DA AUTOMATSKI MANAGE-UJEM RAZLICITE CONTEXTE ZA kubectl, A ULOGA TOG CONTEXTA JE DA TACH-UJE kubectl KAKO DA SE KONEKTUJE DO RAZLICITIH KUBENETES CLUSTERA NA GOOGLE CLOUD-U

## DA VIDIS NEKE HELPFUL INFORMATIONS KUCAJ SAMO `gcloud` U TERMINALU

- `gcloud`

AKO NISI VIDEO HELPFUL INFO TO ZNACI DA TI NESTO NIJE U RED USA INSTLACIJOM

KOD MENE JE SVE U REDU, JER SAM VIDEO TAJ HELPFUL INFO

# SADA CU DA SE LOG-UJEM U GCLOUD SDK

OTVORI I GOOGLE CHROME, LAKSE CES SE PRIJAVITI

- `gcloud auth login`

U BROWSERU CE TI BITI OTVOREN WINDOW GDE CES UPISATI SVOJE GOOGLE CREDENTIALS

TREBA NESTO DA ALLOW-UJES I BICES PRIJAVLJEN

U BROWSER-U CES BITI REDIRECCTED NA [NA OVU STRANICU](https://cloud.google.com/sdk/auth_success)

A U TERMINALU CES DOBITI OVAJ OUTPUT

```zsh
You are now logged in as [bajic.rade2@gmail.com].
Your current project is [None].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID

```

# SADA RUNN-UJ GCLOUD INITIALIZATION

- `gcloud init`

IZABERI OPCIJU DVA OF CREATING CONFIGURATION

ZADAO SAM IME ZA KONFIGURACIJU

PA KADA SE TO ODRADI BIRACES ACCOUNT,; TI IMAS ONAJ SAMO JEDAN GOOGLE ACCOUNT (JEDAN EMAIL ADRESS JE LISTED; NJEGA BIRAS)

**SADA TI JE PONUDJENA LISTA PROJEKATA KOJE TI IMAS; TI SADA IMAS SAMO JEDAN PROJEKAT A TO JE ONAJ KOJEM SI DAO ID `microticket` (USTVARI TO JE NAME)**

IZABRAO SAM GA

**SADA SI PROMPTED DA PODES DEFAULT COMPUTE REGION I ZONE (IZABERI `Yes)**

IZABRACU ONAJ REGION KOJI SA VEC PODESIO ZA CLUSTER (NE ZNA DA LI SMEM NEKI DRUGI ALI PO NEKOJ COMMON LOGICI BIRACU TAJ REGION)

USTVARI MENI TAJ REGION NIJE LISTED OVDE, LISTED JE SAMO ZAPADNA EVROPA BEZ CENTRALNE; NE NAM ZASTO

HAJDE DA UPOREDIM, OTISAO SAM U DASHBOARD I OTVORIO CLUSTER

I ZONU KOJU SAM TAMO IZABRAO JESTE `europe-central2-b`, MEDJUTIM JA SADA TO NEMEM; (ZAT OSAM ODLUCIO DA UNISTIM SAMI CLUSTER I NAPRAVIM NOVI NA ISTI NACIN KAKO SAM TO RADIO, KAKO BI ZADAO NEKU OD ZAPADNOEVROPSKIH ZONA) (NE ZNAM DA LI SAM MORAO OVO URADITI ALI VALJDA STEDIM RESURSE AKO POGODIM ISTE ZONE) TAKO DAA SAM NAPRAVIO NOVI CLUSTER U ZONI `europe-west2-b`

***

NAPRAVIO SAM GRESKU, JER SE LISTA U PROMPTU MOZE PROSIRITI KUCANJEM `list` ALI NEMA VEZE

***

TAKO DA CU SADA SELEKTOVATI ISTU ZONU OVDE U PROMPTU

I TO JE SVE STA SAM TREBAO URADITI

# DAKLE PODESILI SMO GOOGLE CLOUD

REKLI SMO DA KORISTI MOJ GMAIL ACCOUNT, SA KOJI MSAM SE LOGOVAO

REKAO SAM ZA PROJECT

REKAO SAM ZA REGION NA KOJI SE KONEKTUJEMO

## JOS NISAM REKAO GOOGLE SDK-JU DA MANGE-UJE CONTEXT ZA kubectl

TO CU USLEDECEM BRANCH-U
