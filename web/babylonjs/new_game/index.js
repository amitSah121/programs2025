const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

const folder_name = process.argv.slice(2)[0];
const custom_port = process.argv.slice(2)[1];

app.use(bodyParser.text()); // accept plain text for files_order.txt
app.use(express.json());

// console.log(folder_name);

let dir_name = "";
if(folder_name != undefined)
  dir_name = `res/${folder_name}`;// book_1"; // replace it with res/some_dirname inside res folder and use it as your custom workspace
else
  dir_name = `res`;
const resDir = path.join(__dirname, dir_name);
const orderFilePath = path.join(resDir, "files_order.txt");
const contentFilePath = path.join(resDir, "file_content.json");

if (!fs.existsSync(resDir)) fs.mkdirSync(resDir);
if (!fs.existsSync(orderFilePath)) fs.writeFileSync(orderFilePath, "");
if (!fs.existsSync(contentFilePath)) fs.writeFileSync(contentFilePath, "{}");

function generateId() {
  return "ide" + Math.floor(Math.random() * 1000000);
}

// app.use("/res", express.static(path.join(__dirname, "res")));

app.post("/api/update-order", (req, res) => {
  const rawText = req.body;
  const lines = rawText
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const updatedLines = [];
  const newContent = {};
  const existingContent = JSON.parse(fs.readFileSync(contentFilePath, "utf8"));

  const seenIdentities = new Set();

  for (let line of lines) {
    // Match format: - or -- or --- etc., followed by space, filename, optional identity
    let match = line.match(/^(-+)\s+(.*?)\s*(ide\d+)?$/);

    if (!match) {
      // Malformed line — ignore or handle as needed
      continue;
    }

    let [_, dashPrefix, filename, identity] = match;

    if (!identity) {
      identity = generateId();
      newContent[identity] = ""; // default content
    } else {
      if (existingContent[identity]) {
        newContent[identity] = existingContent[identity];
      } else {
        newContent[identity] = "";
      }
    }

    seenIdentities.add(identity);
    updatedLines.push(`${dashPrefix} ${filename} ${identity}`);
  }

  // Write cleaned-up files_order.txt
  fs.writeFileSync(orderFilePath, updatedLines.join("\n"), "utf8");

  // Remove deleted identities from JSON
  const finalContent = {};
  for (let id of seenIdentities) {
    finalContent[id] = newContent[id];
  }

  fs.writeFileSync(
    contentFilePath,
    JSON.stringify(finalContent, null, 2),
    "utf8"
  );

  res.json({ success: true, updatedLines, finalContent });
});

app.get("/api/files", (req, res) => {
  const order = fs.readFileSync(orderFilePath, "utf8");
  const content = JSON.parse(fs.readFileSync(contentFilePath, "utf8"));
  res.json({ order, content });
});

app.get("/api/file", (req, res) => {
  const { name } = req.query;

  if (!name || name.includes("..") || name.includes("/")) {
    return res.status(400).json({ error: "Invalid file name" });
  }

  const filePath = path.join(resDir, name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const content = fs.readFileSync(filePath, "utf8");
  res.type("text/plain").send(content);
});

app.post("/api/file", (req, res) => {
  const { name, content } = req.body;
  if (
    !name ||
    typeof content !== "string" ||
    name.includes("..") ||
    name.includes("/")
  ) {
    return res.status(400).json({ error: "Invalid file name or content" });
  }

  const filePath = path.join(resDir, name);
  fs.writeFileSync(filePath, content, "utf8");

  res.json({ success: true });
});

app.listen(custom_port || 3000, () => {
  console.log(`Server is running at http://localhost:${custom_port || 3000}/public/index.html`);
});

app.use(express.static(__dirname));
