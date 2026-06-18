const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, required: true, enum: ["monthly", "annual"] },
  benefits: [String],
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
