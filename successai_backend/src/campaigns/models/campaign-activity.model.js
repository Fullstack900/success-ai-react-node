import mongoose from 'mongoose';
import CampaignActivityType from '../enum/campaign-activity-type.enum.js';

const campaignActivitySchema = new mongoose.Schema(
    {
        campaign_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        sequence_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CampaignSequence',
            required: true,
        },
        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LeadsCampaign',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(CampaignActivityType),
            required: true,
        },
        account_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        sequence_step: {
            type: Number,
        },
        campaign_email_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CampaignEmail',
            required: true,
        }
    },
    { timestamps: true }
);

campaignActivitySchema.index({campaign_id: 1});
campaignActivitySchema.index({campaign_email_id: 1});


const CampaignActivity = mongoose.model(
    'CampaignActivity',
    campaignActivitySchema,
    'campaign_activity'
);

export default CampaignActivity;
