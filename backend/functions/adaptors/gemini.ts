import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { Credentials, OAuth2Client } from "google-auth-library";

const db = admin.firestore();

interface IOAuthConfig {
    client_id: string | undefined;
    redirect_uri: string;
    scope: string;
}

export const getOAuthConfig = (): IOAuthConfig => {
    return {
        client_id: process.env.GEMINI_CLIENT_ID,
        redirect_uri: `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`,
        scope: "https://www.googleapis.com/auth/generative-language.retriever",
    };
};

const getOauth2Client = (uid: string): OAuth2Client => {
    const oauth2Client = new OAuth2Client(
        process.env.GEMINI_CLIENT_ID,
        process.env.GEMINI_CLIENT_SECRET,
        `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`
    );

    oauth2Client.on('tokens', (tokens: Credentials) => {
        db.collection("users").doc(uid).set({ tokens }, { merge: true });
    });

    return oauth2Client;
}

export const exchangeCodeForToken = async (code: string, uid: string): Promise<Credentials> => {
    const oauth2Client = getOauth2Client(uid);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await db.collection("users").doc(uid).set({ tokens }, { merge: true });
    return tokens;
};

export const hasValidToken = async (uid: string): Promise<boolean> => {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
        return false;
    }

    const data = doc.data();
    if (!data || !data.tokens) {
        return false;
    }

    const oauth2Client = getOauth2Client(uid);
    oauth2Client.setCredentials(data.tokens);

    try {
        const { token } = await oauth2Client.getAccessToken();
        return !!token;
    } catch (error) {
        return false;
    }
};

export const revokeToken = async (uid: string): Promise<void> => {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
        return;
    }

    const data = doc.data();
    if (!data || !data.tokens || !data.tokens.refresh_token) {
        return;
    }

    const oauth2Client = getOauth2Client(uid);
    await oauth2Client.revokeCredentials();
    await db.collection("users").doc(uid).update({ tokens: null });
};

export const sendMessage = async (uid: string, model: string, message: string): Promise<any> => {
    if (!await hasValidToken(uid)) {
        throw new Error("User is not authenticated.");
    }

    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data();
    if (!data || !data.tokens) {
        throw new Error("User does not have any tokens.");
    }

    const oauth2Client = getOauth2Client(uid);
    oauth2Client.setCredentials(data.tokens);

    const genAI = new GoogleGenerativeAI({ authClient: oauth2Client } as any);
    const generativeModel = genAI.getGenerativeModel({ model });

    const result = await generativeModel.generateContent(message);
    const response = await result.response;
    return response.text();
};
