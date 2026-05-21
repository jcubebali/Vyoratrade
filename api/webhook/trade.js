export default function handler(req, res) {
  // Configure CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Restrict to POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const { secret } = req.body || {};

  // Verify secret field matches SG_SECURE_TOKEN_123
  if (secret !== "SG_SECURE_TOKEN_123") {
    console.warn(`[Webhook Validation Failed] Invalid secret provided: ${secret}`);
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("[Webhook Verification Succeeded] Secret matched SG_SECURE_TOKEN_123");
  return res.status(200).json({ success: true });
}
