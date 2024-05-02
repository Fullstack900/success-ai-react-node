import mongoose from 'mongoose';

const leadSaved = new mongoose.Schema(
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
    name : {
        type : String,
        required: true,
    },
    status : {
      type : String,
    },
    leadIds: {
      type: Array,
    },
    skipLeads: {
      type: Number,
    },
    requestIds: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

leadSaved.index({user: 1})

const LeadSaved = mongoose.model(
  'LeadSaved',
  leadSaved,
  'leads_saved'
);

export default LeadSaved;
