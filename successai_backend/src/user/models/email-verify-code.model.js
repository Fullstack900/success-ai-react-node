import mongoose from 'mongoose';

const emailVerifyCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

emailVerifyCodeSchema.index({email: 1})

const EmailVerifyCode = mongoose.model(
  'EmailVerifyCode',
  emailVerifyCodeSchema,
  'email_verify_codes'
);

export default EmailVerifyCode;
