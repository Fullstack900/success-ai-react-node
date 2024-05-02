import mongoose from 'mongoose';

const campaignReplySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    bodyText: {
      type: String,
      required: true,
    },
    bodyTextHtml: {
      type: String,
      required: false,
    },
    from: {
      type: String
    },
    to: {
      type: String
    },
    reply_on: {
      type: Date
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    campaignEmailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignEmail',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    message_id: {
      type: String
    },
    message_text: {
      type: String
    },
    inReplyTo: {
      type: String
    },
    isReplied : {
      type: Boolean, 
      default:false
    },
    date: {
      type: Date
    }
  },
  { timestamps: true }
);

campaignReplySchema.index({message_id: 1})
campaignReplySchema.index({campaignId: 1})
campaignReplySchema.index({campaignEmailId: 1})
campaignReplySchema.index({from: 1})

const CampaignSequence = mongoose.model(
  'CampaignReply',
  campaignReplySchema,
  'campaign_reply'
);

export default CampaignSequence;
