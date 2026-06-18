const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ["free", "trial", "active", "cancelled", "expired"],
    default: "free",
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
  },
  subscriptionEnd: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
