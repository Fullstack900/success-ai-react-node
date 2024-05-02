import mongoose from 'mongoose';

const queuedWarmupSchema = new mongoose.Schema({
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
    ref: 'QueuedWarmup',
  },
	sentAt: {
		type: Date,
		required: true,
		default: Date.now,
		expires: '9d',
	}
});

queuedWarmupSchema.index({from: 1})
queuedWarmupSchema.index({to: 1})
queuedWarmupSchema.index({messageId: 1})

const QueuedWarmup = mongoose.model(
  'QueuedWarmup',
  queuedWarmupSchema,
  'queued_warmup'
);

export default QueuedWarmup;
