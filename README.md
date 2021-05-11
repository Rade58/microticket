# REPLICATED DATA IN `payments` MICROSERVICE

JASNO JE DA CE TO BITI `Orders` KOLEKCIJA

payments CE LISTENOVATI ZA `"order:created"` I ZA `"order:cancelled"`

A PUBLISH-OVACE `"charge:created"`

**PRIMARY COLLECTION U DATBASE-U CE BITI `Charges`**

**SECONDARY COLLECTION U DATBASE-U CE BITI `Orders`**

# MI MORAMO RAZMISLJATI O TOME KOJE FIELD-OVE Orders-A MI ZELIMO DA REPLICIRAMO

`id`

`status`

`version`

`userId`

`price`
