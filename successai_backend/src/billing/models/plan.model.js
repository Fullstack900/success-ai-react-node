import mongoose from 'mongoose';
import BillingCategory from '../enum/billing-category.js';
import BillingPeriod from '../enum/billing-period.enum.js';
import SubscriptionType from '../enum/subscription-type.enum.js';

const planSchema = new mongoose.Schema({
  priceId: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: Object.values(BillingCategory),
    required: true,
  },
  billingPeriod: {
    type: String,
    enum: Object.values(BillingPeriod),
    required: true,
  },
  subscriptionType: {
    type: String,
    enum: Object.values(SubscriptionType),
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: {
    type: Object,
    required: true,
    default: null,
  },
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
