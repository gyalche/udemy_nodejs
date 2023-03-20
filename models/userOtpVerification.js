import mongoose from 'mongoose';
const otpSchema = new Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiredAt: Date,
});

const otpVerification = mongoose.model('otpVerification', otpSchema);
export default otpVerification;
