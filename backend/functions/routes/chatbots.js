const express = require("express");
const router = express.Router();

// Placeholder for Gemini adapter
const gemini = require("../adaptors/gemini");

// /oauth/config
router.get("/oauth/config", (req, res) => {
  res.json(gemini.getOAuthConfig());
});

// /oauth/callback
router.get("/oauth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    await gemini.exchangeCodeForToken(code);
    res.send("<script>window.close();</script>");
  } catch (error) {
    res.status(500).send("Error exchanging code for token");
  }
});

// /oauth/status
router.get("/oauth/status", async (req, res) => {
  try {
    const hasToken = await gemini.hasValidToken();
    res.json({ connected: hasToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /oauth/disconnect
router.post("/oauth/disconnect", async (req, res) => {
  try {
    await gemini.revokeToken();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /chat
router.post("/chat", async (req, res) => {
    try {
        const { provider, model, message } = req.body;
        if (provider === 'gemini') {
            const response = await gemini.sendMessage(model, message);
            res.json({ response });
        } else {
            res.status(400).json({ error: 'Unsupported provider' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
