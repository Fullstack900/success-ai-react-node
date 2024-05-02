import mongoose from 'mongoose';

const engineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        },
        microsoftProvider: {
            type: String,
            required: true,
        },
        googleProvider: {
            type: String,
            required: true,
        },
        totalAccounts: {
            type: Number,
            required: true,
        },

    },
    {
        timestamps: true,
    }
);

const EmailEngine = mongoose.model('EmailEngine', engineSchema);

export default EmailEngine;