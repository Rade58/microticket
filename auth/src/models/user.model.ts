import { Schema, model, Document, Model } from "mongoose";
// UVOZIM KLASU KOJU SAM MALOCAS NAPRAVIO DA BI MANIPULISAO
// HASHINGOM PASSWORD-A
import { Password } from "../utils/password";
//

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
 * @description useless don't ue it anywhere
 * @deprecated
 */
userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

// DEFINISEM PRE HOOK
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // IAKO KREIRAS USERA FOR THE FIRST TIME
  // ZNACICE DA JE password MODIFIED

  const doc = this as UserDocumentI;

  const password = doc.get("password");

  const hashedPassword = await Password.toHash(password);

  doc.set("password", hashedPassword);
});

const User = model<UserDocumentI, UserModelI>("User", userSchema);

export { User };
