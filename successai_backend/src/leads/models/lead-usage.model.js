import mongoose from 'mongoose';

const leadUsage = new mongoose.Schema(
  {
    amount: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type : {
        type : String,
        default : "Credit used"
    }
  },
  {
    timestamps: true,
  }
);

leadUsage.index({user: 1})

const LeadsUsage = mongoose.model(
  'LeadsUsage',
  leadUsage,
  'leads_usage'
);

export default LeadsUsage;
