// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Serve static frontend files from 'public'
app.use(express.static("public"));

// Serve audio files from '/audio' URL path
app.use("/audio", express.static(path.join(__dirname, "audio")));

// API to list all audio files
app.get("/list-audio", (req, res) => {
  const audioDir = path.join(__dirname, "audio");
  fs.readdir(audioDir, (err, files) => {
    if (err)
      return res.status(500).json({ error: "Failed to read audio directory" });
    const audioFiles = files.filter((f) => /\.(mp3|wav|ogg)$/i.test(f));
    res.json(audioFiles);
  });
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
