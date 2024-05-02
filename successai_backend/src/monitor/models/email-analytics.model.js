import mongoose from 'mongoose';

const emailAnalyticsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        count: {
            type: Number,
            required: true,
            default: 0,
        },
        type: {
            type: String,
        },
        dateWithoutTime: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

emailAnalyticsSchema.index({ user: 1 });

const EmailAnalytics = mongoose.model(
    'email-analytics',
    emailAnalyticsSchema,
);

export default EmailAnalytics;