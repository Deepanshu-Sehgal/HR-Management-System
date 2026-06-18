const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  status: {
    type: String,
    enum: ["active", "trial", "cancelled", "expired"],
    default: "trial",
  },
  startedAt: { type: Date, default: Date.now },
  endAt: { type: Date, required: true },
  paymentMethod: { type: String },
  history: [
    {
      event: String,
      date: { type: Date, default: Date.now },
      notes: String,
    },
  ],
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
