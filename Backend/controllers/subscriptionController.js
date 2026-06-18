const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

exports.createPlan = async (req, res) => {
  const { name, price, interval, benefits } = req.body;

  try {
    const plan = await SubscriptionPlan.create({
      name,
      price,
      interval,
      benefits,
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeUser = async (req, res) => {
  const { planId, paymentMethod, trialDays = 7 } = req.body;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.interval === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      user: user._id,
      plan: plan._id,
      status: "active",
      startedAt: startDate,
      endAt: endDate,
      paymentMethod,
      history: [{ event: "subscribed", notes: `Subscribed to ${plan.name}` }],
    });

    user.subscriptionStatus = "active";
    user.subscriptionPlan = plan._id;
    user.subscriptionEnd = endDate;
    await user.save();

    res.status(201).json({ subscription, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id }).populate("plan");
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "cancelled";
    subscription.history.push({ event: "cancelled", notes: "User cancelled subscription" });
    await subscription.save();

    const user = await User.findById(req.user._id);
    user.subscriptionStatus = "cancelled";
    await user.save();

    res.status(200).json({ message: "Subscription cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
