import mongoose from 'mongoose';

const planUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activeLeads: {
      type: Number,
      default: 0,
    },
    monthlyEmails: {
      type: Number,
      default: 0,
    },
    aiWriterCredits: {
      type: Number,
      default: 0,
    },
    freeTrialExpiresAt: {
      type: Date,
      default: null,
    },
    leadsCredits: {
      type: Number,
      default: 0,
    },
    dailyLeadsCredits: {
      type: Number,
      default: 500,
    }
  },
  { timestamps: true }
);
planUsageSchema.index({user: 1})

const PlanUsage = mongoose.model('PlanUsage', planUsageSchema, 'plan_usages');

export default PlanUsage;
