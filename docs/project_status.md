# Thoughtless v2 - Project Status

## User Preferences
- **Voice Input:** Primary input method when available
- **Concise Output:** ~6 lines max for web interfaces due to screen zoom
- **Command Execution:** Use "run command" button, no direct terminal access
- **File Operations:** Provide complete file replacements, not partial edits

## Project Overview
**Thoughtless v2** enables users of multiple AI chatbots to contribute conversations to a central Firestore database for public display. Core purpose: demonstrate AI is for meaningful dialogue, not information search.

**User Roles:** Public (view), Supporters (view+comment), Contributors (create+contribute), Admin (manage users)

## Current Architecture
- **Firebase Project:** `thoughtless-v2` (Blaze Plan)
- **API Endpoint:** `https://us-central1-thoughtless-v2.cloudfunctions.net/api`
- **Backend:** TypeScript, Node.js, Express.js on Firebase Functions (2nd Gen)
- **Frontend:** React, Vite, Tailwind CSS on Firebase Hosting
- **Security:** Firebase Authentication + encrypted credential storage
- **Gemini Integration:** OAuth2 authentication in progress

## File Structure
```
backend/functions/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── App.tsx
│   ├── firebase.ts
│   └── index.css
├── index.html
├── package.json
└── vite.config.ts
```

## Immediate Next Steps
1. **Deploy frontend:** Deploy the frontend to a public URL.

## Development Status
- ✅ **Infrastructure:** New Firebase project created and configured.
- ✅ **Backend:** Basic backend structure created and deployed.
- ✅ **Frontend:** Basic frontend structure created and deployed.
- ✅ **Authentication:** User authentication implemented and tested.
- ✅ **OAuth2:** OAuth2 flow completed.

Last Updated: 2025-08-20