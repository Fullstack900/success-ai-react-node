import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
  },
  dkimSelector: {
    type: [String],
  }
});
domainSchema.index({domain: 1})
const Domain = mongoose.model(
  'Domain',
  domainSchema,
  'domain'
);

export default Domain;
