import mongoose from "mongoose";

const rocketReachApiUsage = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      searchPerson: {
        type: Number,
        default: 0,
      },
      searchCompany: {
        type: Number,
        default: 0,
      },
      personLookup: {
        type: Number,
        default: 0,
      },
      bulkLookup: {
        type: Number,
        default: 0,
      },
      searchSuggestions: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );


const RocketReachApiUsage = mongoose.model("RocketReachApiUsage", rocketReachApiUsage);

export default RocketReachApiUsage;