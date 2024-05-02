
import mongoose from 'mongoose';

const Subscription = new mongoose.Schema({
  _id: false,
  id: {
    type: String,
    required: true,
  },
  planId: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  resetDate : {
    type: Date,
  },
  planType : {
    type: String,
  }
});

const userPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  freeTrialExpiresAt: {
    type: Date,
    required: true,
  },
  subscription: {
    sendingWarmup: Subscription,
    leads: Subscription,
  },
});

userPlanSchema.index({user: 1})
userPlanSchema.index({stripeCustomerId: 1})

const UserPlan = mongoose.model('UserPlan', userPlanSchema, 'user_plans');

export default UserPlan;
