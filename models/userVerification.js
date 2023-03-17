import mongoose from 'mongoose';

const UserVerificationSchema = new Schema({});

const userVerication = mongoose.model(
  'userVerification',
  UserVerificationSchema
);
export default userVerication;
