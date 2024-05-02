import mongoose from 'mongoose';

const tfaCodeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

tfaCodeSchema.index({user: 1})

const TfaCode = mongoose.model('TfaCode', tfaCodeSchema, 'tfa_codes');

export default TfaCode;
