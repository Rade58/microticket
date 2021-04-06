import { Schema, model, Document, Model } from "mongoose";

import { Password } from "../utils/password";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  // EVO U OVOM OPTIONS OBJEKTU ZADAJEM
  // `toJSON` (CAK KADA SI PRITISNUO Ctrl + Space
  // IMAO SI PONUUDJENO, STO ZNACI DA OVO LJUDI DOSTA KORISTE
  //  PA ZATO JE I TYPED)
  {
    toJSON: {
      // OVDE SETTOVANJEM OVIH PROPERTIJA POMAZEM MONGOOSE-U
      // DA UZME USER DOCUMENT I PRETVORI GA U JSON
      // KAKO FUNKCIONISU METODE KOJE SU OVDE MOZES OTKRITI
      // PREKO Ctrl + Alt + Click NA toJson
      // KORISTICU transform METODU
      transform(doc, ret, options) {
        // doc JE DOKUMENT OBTAINEED IZ DATABASE-A
        // ret JE JSON doc OBJEKTA, STO ZNACI DA JE MONGOOSE POKUSAO DA
        // NAPRAVI JSON OD DOKUMENTA
        // MI MORMO MODIFIKOVATI ret OBJECT
        // NISTA NECEMO RETURN-OVATI SAMO DIREKTNO MENJAMO ret
        // UKLONICEMO password JER NE ZELIM ODA SE ON POJAVI
        // UBILO KOJOJ JSON REPREZENTACIJI

        // TO RADIMO TAKO STI KORISTIMO delete OPERATOR
        delete ret.password;
        // UKLONICEMO I __v
        delete ret.__v;

        // A DODAJEMO id PROPERI
        ret.id = ret._id;

        // UKLANJAMO _id
        delete ret._id;
      },
    },
  }
);

interface UserFieldsI {
  email: string;
  password: string;
}

interface UserDocumentI extends Document, UserFieldsI {
  /* email: string;
  password: string; */
}

interface UserModelI extends Model<UserDocumentI> {
  buildUser(inputs: UserFieldsI): Promise<UserFieldsI>;
}

/**
 * @description useless don't use it anywhere
 * @deprecated
 */
userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const doc = this as UserDocumentI;

  const password = doc.get("password");

  const hashedPassword = await Password.toHash(password);

  doc.set("password", hashedPassword);

  next();
});

const User = model<UserDocumentI, UserModelI>("User", userSchema);

export { User };
