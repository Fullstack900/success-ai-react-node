import mongoose from 'mongoose';

const leadCampaignSaved = new mongoose.Schema(
  {
    data: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaign : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    batchId : {
      type: String,
    },
    batchCreated:{
    type: Date,
    },
    batchDuplicates: {
      type:Number,
    },
    batchQuantity: {
      type:Number,
    },
    batchStatus: {
      type : String,
    },
    status : {
      type : String,
    },
    leadIds: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

leadCampaignSaved.index({user: 1})

const LeadCampaignSaved = mongoose.model(
  'LeadCampaignSaved',
  leadCampaignSaved,
  'lead_Campaign_Saved',
);

export default LeadCampaignSaved;
