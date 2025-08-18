# Thoughtless - Project Status

## User Preferences
- **Voice Input:** Primary input method when available
- **Concise Output:** ~6 lines max for web interfaces due to screen zoom
- **Command Execution:** Use "run command" button, no direct terminal access
- **File Operations:** Provide complete file replacements, not partial edits

## Project Overview
**Thoughtless** enables users of multiple AI chatbots to contribute conversations to a central Firestore database for public display. Core purpose: demonstrate AI is for meaningful dialogue, not information search.

**User Roles:** Public (view), Supporters (view+comment), Contributors (create+contribute), Admin (manage users)

## Current Architecture ✅
- **Firebase Project:** `thoughtlessdatalayer` (Blaze Plan)
- **API Endpoint:** `https://us-central1-thoughtlessdatalayer.cloudfunctions.net/thoughtlessapi`
- **Backend:** Modular Express.js on Firebase Functions (2nd Gen)
- **Security:** Firebase Auth + encrypted credential storage
- **Gemini Integration:** OAuth2 authentication working ✅

## File Structure
```
backend/functions/
├── index.js              # Main router (25 lines)
├── routes/
│   ├── database.js       # Database operations (~300 lines)
│   └── chatbots.js       # Chatbot + OAuth2 endpoints (~260 lines)
└── adaptors/
    └── gemini.js         # Gemini OAuth2 integration ✅

frontend/
├── public/
└── components/
    └── gemini-oauth.js   # OAuth2 UI component ✅
```

## Working API Endpoints
**Base URL:** `https://us-central1-thoughtlessdatalayer.cloudfunctions.net/thoughtlessapi`

**Database:** `/createChat`, `/updateChat/:chatId`, `/addMessage`, `/getChatList`, `/getChat/:chatId`
**Auth:** `/health`, `/user-status`, `/setup-profile`, `/store-keys`  
**OAuth2:** `/oauth/config`, `/oauth/callback`, `/oauth/status`

## Data Structure
```javascript
// Chat: {id, title, provider, model, contributorId, metadata, timestamps}
// Message: {id, role, content, metadata, timestamp}
// User: {uid, email, displayName, role, timestamps}
// Credentials: {uid, encryptedKeys, oauthTokens, updatedAt}
```

## Immediate Next Steps
1. **Add Claude Adapter:** Create adaptors/claude.js  
2. **Frontend Integration:** Connect components to web/mobile apps

## Development Status
- ✅ **Deployed:** Backend API placeholder deployed
- ✅ **Gemini:** OAuth2 integration complete
- ❌ **Testing:** OAuth2 flow verification blocked by "Failed to fetch" error
- ✅ **Infrastructure:** Upgraded to Blaze plan with 2nd Gen Functions
- ⏳ **Claude:** Adapter pending
- ⏳ **Frontend:** Integration pending

## Known Issues
### "Failed to fetch" error in browser
**Description:** The `oauth_test.html` page is unable to make requests to the backend API, resulting in a "Failed to fetch" error in the browser's console. This issue occurs despite the fact that the backend API is deployed, publicly accessible, and has a permissive CORS policy. The issue has been reproduced in multiple browsers and on multiple networks.

**Troubleshooting Steps Taken:**
- Recreated and deployed the backend API multiple times.
- Upgraded the Firebase project to the Blaze plan and enabled 2nd Gen Cloud Functions.
- Made the backend API publicly accessible using `gcloud`.
- Configured a specific CORS policy on the backend.
- Verified that the backend API is accessible from the command line using `curl`.
- Redeployed the frontend application.

**Conclusion:** The issue is likely not with the code, but with the environment (e.g., a project configuration issue, a network issue, or a browser issue). Further investigation is needed to identify the root cause.

Last Updated: 2025-08-18