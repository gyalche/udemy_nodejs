import mongoose from 'mongoose';

const UserVerificationSchema = new Schema({
  name: String,
  email: String,
  password: String,
  dateOfBirth: String,
  verified: Boolean,
});

const userVerification = monogoose.model(
  'userVerification',
  UserVerificationSchema
);

export default userVerification;
