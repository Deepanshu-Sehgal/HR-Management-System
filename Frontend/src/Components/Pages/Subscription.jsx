import React, { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        apiClient.get("/subscription/plans"),
        apiClient.get("/subscription/me"),
      ]);
      setPlans(plansResponse.data);
      setSubscription(subscriptionResponse.data);
      setSelectedPlan(plansResponse.data[0]?._id || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load subscription data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post("/subscription/subscribe", {
        planId: selectedPlan,
        paymentMethod: "card",
      });
      setSubscription(response.data.subscription);
      alert("Subscription active. Welcome aboard!");
    } catch (err) {
      setError(err.response?.data?.message || "Subscription failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    setError(null);

    try {
      await apiClient.post("/subscription/cancel");
      setSubscription((prev) => ({ ...prev, status: "cancelled" }));
      alert("Subscription cancelled successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setSaving(false);
    }
  };

  const statusText = subscription
    ? `${subscription.status} until ${new Date(subscription.endAt).toLocaleDateString()}`
    : "No active subscription";

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "16px" }}>Subscription Plan</h2>
      {loading ? (
        <p>Loading subscription options...</p>
      ) : (
        <>
          {error && (
            <div style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</div>
          )}
          <div style={{ display: "grid", gap: "18px", marginBottom: "24px" }}>
            {plans.length ? (
              plans.map((plan) => (
                <div
                  key={plan._id}
                  style={{
                    border: plan._id === selectedPlan ? "2px solid #2563eb" : "1px solid #d1d5db",
                    borderRadius: "12px",
                    padding: "18px",
                    backgroundColor: plan._id === selectedPlan ? "#eff6ff" : "#ffffff",
                  }}
                >
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="subscriptionPlan"
                      value={plan._id}
                      checked={selectedPlan === plan._id}
                      onChange={() => setSelectedPlan(plan._id)}
                      style={{ marginRight: "12px" }}
                    />
                    <strong>{plan.name}</strong>
                    <span style={{ marginLeft: "12px", color: "#4b5563" }}>
                      ${plan.price}/{plan.interval}
                    </span>
                  </label>
                  <p style={{ margin: "10px 0 0", color: "#374151" }}>
                    {plan.benefits?.join(" • ")}
                  </p>
                </div>
              ))
            ) : (
              <p>No plans are configured yet. Please create plans in the backend.</p>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ marginBottom: "6px" }}>Current subscription:</p>
            <strong>{statusText}</strong>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSubscribe}
              disabled={saving || !selectedPlan}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Processing..." : "Activate Subscription"}
            </button>
            {subscription?.status === "active" && (
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  padding: "12px 22px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#111827",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
