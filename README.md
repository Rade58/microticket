# CREATING User MODEL

***

MISLIM DA JE NAJBOLJE KORISTITI `@typegoose/typegoose` STO SE TICE KORISCENJA TYPESCRIPT-A SA MONGOOSE-OM

**[@typegoose/typegoose](https://github.com/typegoose/typegoose)**

**KORISTICU PRINCIP KOJI KORISTI AUTOR WORKSHOP-A SAMO STO CE BITI MALO PRILAGODJEN JER MI SE NE SVIDJA U POTPUNOSTI**

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

// UGLAVNOM CU GA ISKORISTITI DA KADA PRISTUPIM
// REZULTATU QUERY-JA ILI MUTATION-U DA IMAM LISTED FIELD-OVE
// SA REZULTATA
interface UserFieldsI extends Document {
  email: string;
  password: string;
  // AKO BUDES IMAO VISE FIELD-OVA, SAMO CU OVDE MORATI
  // DODAVATI NOVE TYPE-OVE, NECU TO MORATI NIGDE DODATNO RAADITI
}

// OMOGUCICE MI DA MOGU DA TYPE-UJEM
// STATICKE METODE NA MODELU
interface UserModelI extends Model<UserFieldsI> {
  buildUser(this: UserModelI, fields: UserFieldsI): Promise<UserFieldsI>;
}

// PROBLEM CE BITI JEDINO STO MORAM TYPE-OVATI this
// OCEKUJEM DA JE this USTVARI INSTANCA MODELA
// ZATO SAM ODMAH NA POCETKU METODE TYPE-OVAO this KEYWORD
// ISTO TAKO BITNO MI JE DA UPRAVO ZBOG this, OVO NE BUDE
// ARROW FUNKCIJA
userSchema.statics.buildUser = async function (fields) {
  const User = this as UserModelI;

  const newUser = await User.create(fields);

  return { email: newUser.email, password: newUser.password };
};

// SADA NA MODELU MOZES ODMAH UZETII ONU STATICKU METODU
const User = model<UserFieldsI, UserModelI>("User", userSchema);

export { User };

```

**STATICKA METODA JE TA KOJU ODMAH MOZES KORISTITI SA MODELA, DAKLE ODMAH JE MOZES PRIMENITI**
