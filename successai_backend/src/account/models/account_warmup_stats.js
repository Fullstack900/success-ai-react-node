import mongoose from 'mongoose';

const accountWarmupStatSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		emailId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Account',
			required: true,
		},
		inbox_count: {
			type: Number,
			// required: true,
			default: 0,
			min: 0,
		},
		spam_count: {
			type: Number,
			// required: true,
			default: 0,
			min: 0,
		},
		received_count: {
			type: Number,
			default: 0,
		},
		sent_count: {
			type: Number,
			// required: true,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: true,
		// Set the TTL (Time to Live) index for automatic document expiration
		expires: '9d' // Documents will expire 9 days after the "createdAt" timestamp
	}
);

accountWarmupStatSchema.index({createdAt: 1},{expireAfterSeconds: 777600})
accountWarmupStatSchema.index({emailId: 1})
accountWarmupStatSchema.index({email: 1})


const AccountWarmupStats = mongoose.model('Account_Warmup_Stats', accountWarmupStatSchema);

export default AccountWarmupStats;
