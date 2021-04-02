# CREATING User MODEL

***
***

digresija:

ONO STO CE SE DESITI UNINTENTIONALLY U OVOM BRANCH-U, JESTE REINVENTING THE WHEEL

**ALI NEMA VEZE, BAR CU NAUCITI NESTO VISE O MONGOOSE-U I MONGO-U**

***
***

***
***

MISLIM DA JE NAJBOLJE KORISTITI `@typegoose/typegoose` STO SE TICE KORISCENJA TYPESCRIPT-A SA MONGOOSE-OM

**[@typegoose/typegoose](https://github.com/typegoose/typegoose)**

**KORISTICU PRINCIP KOJI KORISTI AUTOR WORKSHOP-A SAMO STO CE BITI MALO PRILAGODJEN JER MI SE NE SVIDJA U POTPUNOSTI**

***
***

- `mkdir auth/src/models`

- `touch auth/src/models/user.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// SLUZICE DA SE TYPE-UJU ARGUMENTI PRI POHRANJIVANJU U DATABASE
interface UserFieldsI {
  email: string;
  password: string;
}

// OVAJ INTERFACE, UGLAVNOM CU GA ISKORISTITI DA KADA PRISTUPIM
// REZULTATU QUERY-JA ILI MUTATION-U DA IMAM LISTED FIELD-OVE
// SA REZULTATA
interface UserDocumentI extends Document, UserFieldsI {
  /* email: string;
  password: string; */
  // AKO BUDES IMAO VISE FIELD-OVA
  // NECU TO MORATI NIGDE DODATNO TYPE-OVATI
  // JEDINO U GORNJEM UserFieldsI
  // JER GA ONO EXTEND-UJE
}

// OMOGUCICE MI DA MOGU DA TYPE-UJEM
// STATICKE METODE NA MODELU
interface UserModelI extends Model<UserDocumentI> {
  buildUser(inputs: UserFieldsI): Promise<UserFieldsI>;
}

// PROBLEM CE BITI JEDINO STO MORAM TYPE-OVATI this
// OCEKUJEM DA JE this USTVARI INSTANCA MODELA
// ZATO SAM ODMAH NA POCETKU METODE TYPE-OVAO this KEYWORD
// ISTO TAKO BITNO MI JE DA UPRAVO ZBOG this, OVO NE BUDE
// ARROW FUNKCIJA
userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

// SADA NA MODELU MOZES ODMAH UZETII ONU STATICKU METODU
const User = model<UserDocumentI, UserModelI>("User", userSchema);

// --------------- TYPESCRIPT PROVERE -----------------
// PROVERA DA LI CE TYPESCRIPT YELL-OVATI AKO DODAM EXTRA FIELD
// KOJI NIJE TYPED
User.buildUser({
  email: "",
  password: "",
  // STAVIO SAM OVDE name, I TYPESCRIPT JE YELL-OVAO NA MENE
  name: ""
}).then((user) => {
  // PROVERA DA VIDIM DA LI JE SVE NA USER-U, STA SAM ZELEO
  user.  // VIDECES DA JESTE (TU SU email I password)
});

export { User };
```

**STATICKA METODA JE TA KOJU ODMAH MOZES KORISTITI SA MODELA, DAKLE ODMAH JE MOZES PRIMENITI** (TO JE KORISTIO AUTOR WORKSHOP-A, A JA SAM TO MALO JACE TYPE-OVAO)

## MEDJUTIM IMAM DILEMU DA LI BI BILO BOLJE DA SAM U GORNJOJ STATICKOJ METODI SAMO RETURN-OVAO NEW USER-A

**SAMO STO MISLIM DA BI JA ONDA REINVENT-OVAO THE WHEEL, JER MOGU ODMAH KORISTITI Model.create METODU**

