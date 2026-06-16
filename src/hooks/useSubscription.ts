import { useState, useEffect } from "react";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";

export function useSubscription() {
  const [isPro, setIsPro] = useState(false);
  const [status, setStatus] = useState("inactive");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsPro(false);
        setStatus("inactive");
        setSubscriptionId(null);
        setCurrentPeriodEnd(null);
        setPlanName(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userRef = doc(db, "users", user.uid);
      const unsubSnap = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIsPro(data?.isPro || false);
          setStatus(data?.subscriptionStatus || "inactive");
          setSubscriptionId(data?.subscriptionId || null);
          setCurrentPeriodEnd(data?.currentPeriodEnd || null);
          setPlanName(data?.planName || null);
        } else {
          setIsPro(false);
          setStatus("inactive");
          setSubscriptionId(null);
          setCurrentPeriodEnd(null);
          setPlanName(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error loading user subscription:", error);
        setLoading(false);
      });

      return () => {
        unsubSnap();
      };
    });

    return () => {
      unsubAuth();
    };
  }, []);

  const startCheckout = async (variantId?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please sign in to upgrade your plan.");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          email: currentUser.email,
          variantId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to initiate purchase.");
      }

      const resJson = await response.json();
      if (resJson.checkoutUrl) {
         // Direct user to external Lemon Squeezy checkout link
        window.location.href = resJson.checkoutUrl;
      } else {
        throw new Error("No checkout URL found in response.");
      }
    } catch (err: any) {
      console.error("Error triggering checkout:", err);
      alert(err.message || "Unable to load checkout.");
    }
  };

  return {
    isPro,
    status,
    subscriptionId,
    currentPeriodEnd,
    planName,
    loading,
    startCheckout,
  };
}
