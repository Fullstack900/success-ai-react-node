import mongoose from 'mongoose';
import CampaignEmailStatus from "../enum/campaign-label.enum.js"
const CampaignEmailLabelSchema = new mongoose.Schema({
name : {
    type: String,
    required : true
},
type : {
    type: String,
    enum: Object.values(CampaignEmailStatus),
    required: true,
},
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},  { timestamps: true })

CampaignEmailLabelSchema.index({createdBy: 1})

const CampaignEmailLabel = mongoose.model(
    'CampaignEmailLabel',
    CampaignEmailLabelSchema,
    'email_label'
  );
  
  export default CampaignEmailLabel;
