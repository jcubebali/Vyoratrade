import { Router } from "express";

const router = Router();

router.post("/checkout", async (req, res) => {
  try {
    const { userId, email, variantId } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing required fields: userId and email are required." });
    }

    const apiKey = process.env.LS_API_KEY;
    const storeId = process.env.LS_STORE_ID;
    const finalVariantId = variantId || process.env.LS_VARIANT_ID;
    const appUrl = process.env.APP_URL;

    if (!apiKey) {
      return res.status(500).json({ error: "LS_API_KEY is not defined in server environment variables." });
    }
    if (!storeId) {
      return res.status(500).json({ error: "LS_STORE_ID is not defined in server environment variables." });
    }
    if (!finalVariantId) {
      return res.status(500).json({ error: "LS_VARIANT_ID is not defined in server environment variables." });
    }
    if (!appUrl) {
      return res.status(500).json({ error: "APP_URL is not defined in server environment variables." });
    }

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: email,
            custom: {
              user_id: userId
            }
          },
          product_options: {
            redirect_url: `${appUrl}/dashboard`
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId.toString()
            }
          },
          variant: {
            data: {
              type: "variants",
              id: finalVariantId.toString()
            }
          }
        }
      }
    };

    console.log("[Lemon Squeezy] Creating checkout for user:", userId, "email:", email, "variant:", finalVariantId);

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const resJson: any = await response.json();

    if (!response.ok) {
      console.error("[Lemon Squeezy] API Error:", JSON.stringify(resJson));
      return res.status(response.status).json({
        error: "Lemon Squeezy API failed to generate checkout.",
        details: resJson.errors || resJson
      });
    }

    const url = resJson?.data?.attributes?.url;
    if (!url) {
      console.error("[Lemon Squeezy] Unexpected response schema:", JSON.stringify(resJson));
      return res.status(500).json({ error: "Lemon Squeezy response did not contain checkout URL." });
    }

    return res.json({ checkoutUrl: url });

  } catch (err: any) {
    console.error("[Checkout Route Error]:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

export default router;
