import mongoose from 'mongoose';

const subRequestSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requests',
        required: true,
    },
    bulkLookupId: {
        type: String,
    },
    status:{
        type: String,
    },
    responseTime: {
        type: Number, // In seconds
    },
    totalCount: {
        type: Number,
    },
    responseCount: {
        type: Number,
    },
},
    {
        timestamps: true,
    }
);

const requestsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        requestType: {
            type: String,
            required: true,
        },
        status: {
            type: String,
        },
        responseTime: {
            type: Number, // In seconds
        },
        leadsCount: {
            type: Number
        },
        totalRequest: {
            type: Number
        },
        servedRequest: {
            type: Number
        },
        usedCredits: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

requestsSchema.index({ user: 1 });

const Requests = mongoose.model(
    'Requests',
    requestsSchema,
);
const SubRequests = mongoose.model('SubRequests', subRequestSchema);

export { Requests, SubRequests };
