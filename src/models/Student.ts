import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  name: string;
  dob: Date;
  email: string;
  country: string;
  profilePhoto?: string;
  password: string;
}

const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  profilePhoto: { type: String },
  password: { type: String, required: true },
});

export default mongoose.model<IStudent>("Student", StudentSchema);
