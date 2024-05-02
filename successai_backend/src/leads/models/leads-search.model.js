import mongoose from 'mongoose';
import SearchType from '../enum/search-type.enum.js';

const leadsSearchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    query: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SearchType),
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

leadsSearchSchema.index({user: 1})

const LeadsSearch = mongoose.model(
  'LeadsSearch',
  leadsSearchSchema,
  'leads_searches'
);

export default LeadsSearch;
