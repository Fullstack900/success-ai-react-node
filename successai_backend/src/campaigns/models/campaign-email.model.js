import mongoose from 'mongoose';
const campaignEmailSchema = new mongoose.Schema(
  {
    unique_id: {
      type: String,
      unique: true,
    },
    subject: {
      type: String,
    },
    body: {
      type: String,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadsCampaign',
      required: true,
    },
    sequence_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignSequence',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    label: {
      type: mongoose.Schema.Types.ObjectId,
      default: "652669bc41eec309ccaf75f5",
      ref: 'CampaignEmailLabel',
    },
    sequence_step: {
      type: Number,
    },
    email_clicked: {
      type: Boolean,
      default: false
    },
    email_opened: {
      type: Boolean,
      default: false
    },
    email_replied: {
      type: Boolean,
      default: false
    },
    automatic_reply: {
      type: Boolean,
      default: false
    },
    email_clicked_on: {
      type: Date,
    },
    email_opened_on: {
      type: Date,
    },
    email_replied_on: {
      type: Date,
    },
    email_bounced: {
      type: Boolean,
      default: false
    },
    email_unsub: {
      type: Boolean,
      default: false
    },
    email_unsub_on: {
      type: Date,
    },
    email_bounce_checked: {
      type: Boolean,
      default: false
    },
    is_reply: {
      type: Boolean,
      default: false
    },
    email_bounced_on: {
      type: Date,
    },
    sent_on: {
      type: Date,
    },
    message_id: {
      type: String
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignReply',
      required: true,
    }],
    portal_email_opened: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
campaignEmailSchema.index({ unique_id: 1 })
campaignEmailSchema.index({ message_id: 1 })
campaignEmailSchema.index({ from: 1 })
campaignEmailSchema.index({ campaign_id: 1 })
campaignEmailSchema.index({ lead_id: 1 })

const CampaignEmail = mongoose.model(
  'CampaignEmail',
  campaignEmailSchema,
  'campaign_emails'
);

export default CampaignEmail;
