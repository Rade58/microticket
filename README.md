# `.todo()`

U PROSLOM BRANCHU SMO NAPISALI NEKE TESTOVE ZA PORDER CREATION HANDLER-A (`orders/src/routes/__test__/new.test.ts`), **MEDJUTIM OSTAO JE JOS JEDAN TEST DA SE URADI**

**ALI TAJ TEST JOS NECU RADITI JER NISAM IMPLEMNIRAO EVENT LOGIKU, ODNOSNO NISAM PUBLISH-OVAO NIKAKAV EVENT IZ `orders/src/routes/new.ts` HANDLERA**

E PA DA NE BI ZABORAVIO, DA MORAM URADITI TAJ TEST NAKON IMPLEMENTACIJE LOGIKE, **JA MOGU U OKVIRU JEST-A NAPRAVITI PODSETNIK ZA TJ TEST**

TO RADIM OVAKO

- `code orders/src/routes/__test__/new.test.ts`

```ts
// ...
// ...

it.todo("publishes event to order:created channel");
```

- `cd orders`

- `yarn test`

U TEST UITE-U CE SE SADA IZMEDJU OSTALOG POKAZIVATI OVAJ MESSAGE, PRI RUNNINGU

```zsh
# ...
  ✎ todo publishes event to order:created channel

Test Suites: 1 passed, 1 total
Tests:       1 todo, 3 passed, 4 total

# ...
```

**TAKO DA IMAS PODSETNIK KOJI TEST TREBAS NAPISATI U BUDUCNOSTI**

A TO JE I SYNTAX HIGHLIGHTED, JER TODO JE PREDSTAVLJEN SA NEKIM PURPLE FONTOM
