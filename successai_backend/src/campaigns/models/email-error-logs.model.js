import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const logSchema = new Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  errorMessage: {
    type: String,
    required: true
  },
  emailAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  messageId: {
    type: String,
  }
});

const ErrorLog = model('ErrorLog', logSchema);

export default ErrorLog;
