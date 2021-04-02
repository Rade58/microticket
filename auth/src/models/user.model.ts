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

// PROVERA DA LI CE TYPESCRIPT YELL-OVATI AKO DODAM EXTRA FIELD
// KOJI NIJE TYPED
User.buildUser({
  email: "",
  password: "",
  name: "",
});

export { User };
