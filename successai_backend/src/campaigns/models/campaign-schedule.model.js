import mongoose from 'mongoose';

const campaignScheduleSchema = new mongoose.Schema(
  {
    isDefault : {
      type : Boolean,
      default: false
    },
    name: {
      type: String,
      required: true,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    timezone: {
      type: String,
    },
    sun: {
      type: Boolean,
      default: false,
    },
    mon: {
      type: Boolean,
      default: true,
    },
    tue: {
      type: Boolean,
      default: true,
    },
    wed: {
      type: Boolean,
      default: true,
    },
    thu: {
      type: Boolean,
      default: true,
    },
    fri: {
      type: Boolean,
      default: true,
    },
    sat: {
      type: Boolean,
      default: false,
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

campaignScheduleSchema.index({campaign: 1})
campaignScheduleSchema.index({createdBy: 1})

const CampaignSchedule = mongoose.model(
  'CampaignSchedule',
  campaignScheduleSchema,
  'campaign_schedules'
);

export default CampaignSchedule;
