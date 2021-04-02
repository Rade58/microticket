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

userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

// SADA NA MODELU MOZES ODMAH UZETII ONU STATICKU METODU
const User = model<UserDocumentI, UserModelI>("User", userSchema);

export { User };
