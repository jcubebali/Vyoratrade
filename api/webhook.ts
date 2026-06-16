import { Router } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const router = Router();

// Initialize Firebase Admin dynamically to safely support any active database configs
let webDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (getApps().length === 0) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    webDb = getFirestore(firebaseConfig.firestoreDatabaseId);
    console.log("[Webhook Firestore] Initialized Firestore successfully under database:", firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn("[Webhook Firestore] firebase-applet-config.json not found during initialize.");
  }
} catch (e) {
  console.error("[Webhook Firestore] Failed to initialize Firebase Admin:", e);
}

router.post("/webhook", async (req, res) => {
  try {
    const signature = req.get("x-signature") || "";
    if (!signature) {
      console.warn("[Webhook] Missing x-signature header.");
      return res.status(401).json({ error: "Missing signature header." });
    }

    const secret = process.env.LS_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Webhook] LS_WEBHOOK_SECRET is not configured.");
      return res.status(500).json({ error: "Webhook secret is missing from environment." });
    }

    // Get raw body as buffer or fallback to JSON.stringify if missing
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    // Timing-safe equal check to protect against timing attacks
    try {
      const digestBuffer = Buffer.from(digest, "hex");
      const signatureBuffer = Buffer.from(signature, "hex");
      if (digestBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
        console.error("[Webhook] Invalid signature match.");
        return res.status(401).json({ error: "Invalid client signature." });
      }
    } catch (e: any) {
      console.error("[Webhook] Error during signature comparison:", e);
      return res.status(401).json({ error: "Signature verification failed." });
    }

    const body = req.body;
    const eventName = body?.meta?.event_name;
    const userId = body?.meta?.custom_data?.user_id;

    console.log("[Webhook] Received validated event:", eventName, "for user:", userId);

    if (!eventName) {
      console.warn("[Webhook] Missing event name in payload.");
      return res.status(200).json({ success: true, message: "No event name found" });
    }

    if (!userId) {
      console.warn("[Webhook] Missing user_id in meta.custom_data. Processing ignored.");
      return res.status(200).json({ success: true, message: "Missing metadata user_id" });
    }

    const updateData: any = {};
    const dataAttributes = body?.data?.attributes;
    const status = dataAttributes?.status;
    const variantName = dataAttributes?.variant_name || "";
    const subscriptionId = body?.data?.id?.toString();
    const currentPeriodEnd = dataAttributes?.renews_at || dataAttributes?.ends_at || "";

    // Determine variant plan check: pro vs elite
    const isElite = variantName.toLowerCase().includes("elite");
    const planFromWebhook = isElite ? "elite" : "pro";

    switch (eventName) {
      case "subscription_created":
        updateData.isPro = true;
        updateData.subscriptionId = subscriptionId || null;
        updateData.subscriptionStatus = status || "active";
        updateData.currentPeriodEnd = currentPeriodEnd;
        updateData.planName = variantName;
        updateData.plan = planFromWebhook;
        break;

      case "subscription_updated": {
        const isActive = status === "active" || status === "on_trial";
        updateData.isPro = isActive;
        updateData.subscriptionStatus = status || "active";
        if (subscriptionId) updateData.subscriptionId = subscriptionId;
        if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;
        if (variantName) {
          updateData.planName = variantName;
          updateData.plan = isActive ? planFromWebhook : "trial";
        } else {
          updateData.plan = isActive ? "pro" : "trial";
        }
        break;
      }

      case "subscription_cancelled":
        updateData.isPro = false;
        updateData.subscriptionStatus = "cancelled";
        updateData.plan = "trial";
        break;

      case "subscription_expired":
        updateData.isPro = false;
        updateData.subscriptionStatus = "expired";
        updateData.plan = "trial";
        break;

      case "subscription_payment_success":
        updateData.lastPaymentAt = new Date().toISOString();
        break;

      case "subscription_payment_failed":
        updateData.subscriptionStatus = "past_due";
        break;

      default:
        console.log("[Webhook] Unhandled event name:", eventName);
        return res.status(200).json({ success: true, message: "Unhandled event" });
    }

    if (Object.keys(updateData).length > 0) {
      if (webDb) {
        console.log("[Webhook] Saving update data to Firestore path:", `users/${userId}`, JSON.stringify(updateData));
        await webDb.collection("users").doc(userId).set(updateData, { merge: true });
        console.log("[Webhook] Successfully saved to Firestore.");
      } else {
        console.error("[Webhook ERROR] Firebase Firestore client is not active or offline. Unable to update user profile.");
      }
    }

    // Always restore standard HTTP 200 to satisfy Lemon Squeezy integration
    return res.status(200).json({ success: true, processed: true });

  } catch (err: any) {
    console.error("[Webhook Route Error Exception]:", err);
    // Explicitly return 200 as specified to avoid endless retry blocks from vendor
    return res.status(200).json({ success: false, error: err.message });
  }
});

export default router;
