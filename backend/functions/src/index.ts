import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { google } from "googleapis";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

const oauth2Client = new google.auth.OAuth2(
  functions.config().gemini.client_id,
  functions.config().gemini.client_secret,
  `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`
);

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
  res.json({
    client_id: functions.config().gemini.client_id,
    redirect_uri: `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`,
    scope: "https://www.googleapis.com/auth/generative-language.retriever",
  });
});

app.get("/oauth/callback", async (req: any, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    await db.collection("users").doc(req.user.uid).set({ tokens });
    res.send("<script>window.close();</script>");
  } catch (error: any) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send(`Error exchanging code for token: ${error.message}`);
  }
});

app.get("/oauth/status", authenticate, async (req: any, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.uid).get();
    if (doc.exists) {
      const { tokens } = doc.data() as any;
      oauth2Client.setCredentials(tokens);
      const { token } = await oauth2Client.getAccessToken();
      if (token) {
        res.json({ connected: true });
      } else {
        res.json({ connected: false });
      }
    } else {
      res.json({ connected: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const api = functions.https.onRequest(app);
