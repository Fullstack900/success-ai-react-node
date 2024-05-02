import mongoose from 'mongoose';

const warmupEmailSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
  inReplyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WarmupEmail',
  },
  isReplied: {
    type: Boolean,
    required: true,
    default: false,
  },
  isOpen: {
    type: Boolean,
    required: true,
    default: false,
  },
  isSpamProtect: {
    type: Boolean,
    required: true,
    default: false,
  },
  isMarkImportant: {
    type: Boolean,
    required: true,
    default: false,
  },
  isMoved: {
    type: Boolean,
    required: true,
    default: false,
  },
  isMoved :{
    type: Boolean,
    required: true,
    default: false,
  },
  sentAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: '9d',
  },
  stats_loaded: {
    type: Boolean,
    default: false,
  },
  bounceCheck: {
    type: Boolean,
    default: false,
  },
});

warmupEmailSchema.index({from: 1})
warmupEmailSchema.index({to: 1})
warmupEmailSchema.index({messageId: 1})

const WarmupEmail = mongoose.model(
  'WarmupEmail',
  warmupEmailSchema,
  'warmup_emails'
);

export default WarmupEmail;
