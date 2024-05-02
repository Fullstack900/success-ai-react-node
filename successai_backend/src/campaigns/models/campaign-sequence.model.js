import mongoose from 'mongoose';

const campaignSequenceSchema = new mongoose.Schema(
  {
    step: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
    },
    body: {
      type: String,
      required: true,
    },
    waitDays: {
      type: Number,
      required: true,
      default: 1,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);
campaignSequenceSchema.index({createdBy: 1})
campaignSequenceSchema.index({campaign: 1})

const CampaignSequence = mongoose.model(
  'CampaignSequence',
  campaignSequenceSchema,
  'campaign_sequences'
);

export default CampaignSequence;
