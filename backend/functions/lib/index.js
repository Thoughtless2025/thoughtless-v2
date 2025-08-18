"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const googleapis_1 = require("googleapis");
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
const oauth2Client = new googleapis_1.google.auth.OAuth2(functions.config().gemini.client_id, functions.config().gemini.client_secret, `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`);
app.get("/oauth/config", (req, res) => {
    res.json({
        client_id: functions.config().gemini.client_id,
        redirect_uri: `https://us-central1-thoughtless-v2.cloudfunctions.net/api/oauth/callback`,
        scope: "https://www.googleapis.com/auth/generative-language.retriever",
    });
});
app.get("/oauth/callback", async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        await db.collection("users").doc("fCnxYAxZteduZpY4ajikXDEL4qH3").set({ tokens }); // Replace "user-id" with the actual user ID
        res.send("<script>window.close();</script>");
    }
    catch (error) {
        console.error("Error exchanging code for token:", error);
        res.status(500).send(`Error exchanging code for token: ${error.message}`);
    }
});
app.get("/oauth/status", async (req, res) => {
    try {
        const doc = await db.collection("users").doc("fCnxYAxZteduZpY4ajikXDEL4qH3").get(); // Replace "user-id" with the actual user ID
        if (doc.exists) {
            const { tokens } = doc.data();
            oauth2Client.setCredentials(tokens);
            const { token } = await oauth2Client.getAccessToken();
            if (token) {
                res.json({ connected: true });
            }
            else {
                res.json({ connected: false });
            }
        }
        else {
            res.json({ connected: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map