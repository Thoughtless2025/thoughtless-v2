const { google } = require("googleapis");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

const getOAuthConfig = () => {
  return {
    client_id: functions.config().gemini.client_id,
    redirect_uri: `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`,
    scope: "https://www.googleapis.com/auth/generative-language.retriever",
  };
};

const getOauth2Client = (uid) => {
    const oauth2Client = new google.auth.OAuth2(
        functions.config().gemini.client_id,
        functions.config().gemini.client_secret,
        `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`
    );

    oauth2Client.on('tokens', (tokens) => {
        db.collection("users").doc(uid).set({ tokens });
    });

    return oauth2Client;
}

const exchangeCodeForToken = async (code, uid) => {
    const oauth2Client = getOauth2Client(uid);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await db.collection("users").doc(uid).set({ tokens });
    return tokens;
};

const hasValidToken = async (uid) => {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
        return false;
    }

    const { tokens } = doc.data();
    if (!tokens) {
        return false;
    }

    const oauth2Client = getOauth2Client(uid);
    oauth2Client.setCredentials(tokens);

    try {
        const { token } = await oauth2Client.getAccessToken();
        return !!token;
    } catch (error) {
        return false;
    }
};

const revokeToken = async (uid) => {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
        return;
    }

    const { tokens } = doc.data();
    if (!tokens || !tokens.refresh_token) {
        return;
    }

    const oauth2Client = getOauth2Client(uid);
    oauth2Client.setCredentials(tokens);

    try {
        await oauth2Client.revokeCredentials();
        await db.collection("users").doc(uid).update({ tokens: null });
    } catch (error) {
        console.error("Error revoking token:", error);
    }
};

const sendMessage = async (uid, model, message) => {
    if (!await hasValidToken(uid)) {
        throw new Error("User is not authenticated.");
    }

    const doc = await db.collection("users").doc(uid).get();
    const { tokens } = doc.data();

    const oauth2Client = getOauth2Client(uid);
    oauth2Client.setCredentials(tokens);

    const generativeLanguage = google.generativelanguage({
        version: "v1beta",
        auth: oauth2Client,
    });

    const response = await generativeLanguage.models.generateContent({
        model: `models/${model}`,
        contents: [{ parts: [{ text: message }] }],
    });

    return response.data;
};

module.exports = {
  getOAuthConfig,
  exchangeCodeForToken,
  hasValidToken,
  revokeToken,
  sendMessage
};