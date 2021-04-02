import { Schema, model, Document } from "mongoose";

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

interface UserFieldsI extends Document {
  email: string;
  password: string;
}

const User = model<UserFieldsI>("User", userSchema);

const a = async () => {
  const b = await User.create({});
};

// OVAJ DOKUMENT CE BITI NAS USER MODEL SA NASIM METODAMA
export { User };
