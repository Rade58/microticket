# REINSTALLING GOOGLE CLOUD SDK




INSTALIRAO SAM GOOGLE CLOUD SDK SA apt-OM I TO NISAM TREBAO URADITI, JER NISAM MOGAO KORISTITI INSTLACIJU KOMPONENTI (ZELEO SAM DA INSTALIRAM kubectl I TO MI TADA NIJE USPELO)

ZATO UKLANJAM GOOGLE CLOUD SDK

- `sudo apt-get remove google-cloud-sdk`


# PONOVNO INSTLAIRANJE

TREABAO SAM TO IPAK URADITI KORISCENJEM SAMO LINUX INSTLACIJE (BIRAJ LINUX JEZICA (PRVI JEZICAK NA SLEDECOJ STRANICI))

<https://cloud.google.com/sdk/docs/install#linux>

PRVO PODESI ENV VARIABLES KOJE SU NAMENJENE PYTHON-U

- `vi ~/.bash_profile`

```zsh
export CLOUDSDK_PYTHON=python3
```

- `source ~/.bash_profile`

- `$CLOUDSDK_PYTHON --version`


- `vi ~/.zshrc`

```zsh
alias CLOUDSDK_PYTHON=python3
```
