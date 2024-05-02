import mongoose from "mongoose";
import LeadStatus from "../enum/lead-status.enum.js";
import mongoosePaginate from "mongoose-paginate";

const leadsCampaignSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
    },
    firstName: {
      type: String,
      default: "firstName",
    },
    email: {
      type: String,
      required: true,
    },
    interest_status: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: LeadStatus.NotContacted,
      enum: Object.values(LeadStatus),
    },
    phone: String,
    lastName: {
      type: String,
      default: "lastName",
    },
    location: String,
    iceBreaker: {
      type: String
    },
    companyName: String,
    title: String,
    website: String,
    isRead : {
      type:Boolean,
      default: false
    },
    test : {
      type:Boolean,
      default: false
    },
    variables: [
      {
        variableTitle: {
          type: String,
          default: null,
        },
        variableValue: {
          type: String,
          default: null,
        },
      }
    ],

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    label: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignEmailLabel',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

leadsCampaignSchema.index({ campaign: 1 });
leadsCampaignSchema.plugin(mongoosePaginate);

leadsCampaignSchema.index({campaign: 1})
leadsCampaignSchema.index({createdBy: 1})
leadsCampaignSchema.index({leadId: 1})


const LeadsCampaign = mongoose.model(
  "LeadsCampaign",
  leadsCampaignSchema,
  "leads_campaign"
);

export default LeadsCampaign;
