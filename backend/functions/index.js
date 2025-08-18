const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: 'https://thoughtlessdatalayer.web.app', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'], exposedHeaders: ['Vary'] }));

// Import and use routes
const databaseRoutes = require("./routes/database");
const chatbotRoutes = require("./routes/chatbots");

app.use("/", databaseRoutes);
app.use("/", chatbotRoutes);

exports.thoughtlessapi = functions.https.onRequest(app);
