import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

const gemini = require("./adaptors/gemini");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const authenticate = async (req: any, res: any, next: any) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
  } catch (e) {
    res.status(403).send('Unauthorized');
  }
};

app.get("/oauth/config", (req, res) => {
  res.json(gemini.getOAuthConfig());
});

app.get("/oauth/callback", authenticate, async (req: any, res) => {
  const { code } = req.query;
  try {
    await gemini.exchangeCodeForToken(code as string, req.user.uid);
    res.send("<script>window.close();</script>");
  } catch (error: any) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send(`Error exchanging code for token: ${error.message}`);
  }
});

app.get("/oauth/status", authenticate, async (req: any, res) => {
  try {
    const connected = await gemini.hasValidToken(req.user.uid);
    res.json({ connected });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/chatbots/message", authenticate, async (req: any, res) => {
    const { model, message } = req.body;
    try {
        const response = await gemini.sendMessage(req.user.uid, model, message);
        res.json(response);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const api = functions.https.onRequest(app);