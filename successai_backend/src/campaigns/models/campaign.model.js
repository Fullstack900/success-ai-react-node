import mongoose from "mongoose";
import CampaignStatus from "../enum/campaign-status.enum.js";
import mongoosePaginate from "mongoose-paginate-v2";

const Options = new mongoose.Schema({
  _id: false,
  emailAccounts: {
    type: Array,
  },
  stopOnReply: {
    type: Boolean,
    default: true,
  },
  stopOnAutoReply: {
    type: Boolean,
    default: true,
  },
  trackOpen: {
    type: Boolean,
    default: true,
  },
  trackClickedLink: {
    type: Boolean,
    default: false,
  },
  dailyMaxLimit: {
    type: String,
    default: "20",
  },
  textOnly: {
    type: Boolean,
    default: false,
  },
});

const TestOptions = new mongoose.Schema({
  _id: false,
  testEmailAccounts: {
    type: Array,
  },

});

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.Draft,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isLaunched: {
      type: Boolean,
      default: false,
    },
    unOpenedEmailsCount: {
      type: Number,
      default: 0,
    },
    campainErrorEmailSent: {
      type: Boolean,
      default: false,
    },
    options: Options,
    test: TestOptions,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    errorMsg: {
      type: String,
    },
    activeSchedule: [{
      From: {
        type: Date,
      },
      To: {
        type: Date,
      }
    }]
  },
  {
    timestamps: true,
  }
);

campaignSchema.plugin(mongoosePaginate);

campaignSchema.virtual("schedules", {
  ref: "CampaignSchedule",
  localField: "_id",
  foreignField: "campaign",
  justOne: false,
});

campaignSchema.virtual("sequences", {
  ref: "CampaignSequence",
  localField: "_id",
  foreignField: "campaign",
  justOne: false,
  options: {
    sort: "step",
  },
});

campaignSchema.virtual("analytics");

campaignSchema.set("toJSON", {
  virtuals: true,
});

campaignSchema.index({createdBy: 1})

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
