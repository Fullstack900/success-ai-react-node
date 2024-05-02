import mongoose from "mongoose";
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    priceId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
couponSchema.index({ code: 1 });
couponSchema.plugin(softDeletePlugin);

const Coupon = mongoose.model("Coupon", couponSchema, "coupon");

export default Coupon;
