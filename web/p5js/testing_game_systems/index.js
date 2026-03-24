const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();


app.use(bodyParser.text()); // accept plain text for files_order.txt
app.use(express.json());

// console.log(folder_name);


function generateId() {
  return "ide" + Math.floor(Math.random() * 1000000);
}

app.get("/api/files", (req, res) => {
  const order = fs.readFileSync(orderFilePath, "utf8");
  const content = JSON.parse(fs.readFileSync(contentFilePath, "utf8"));
  res.json({ order, content });
});

app.get("/api/file", (req, res) => {
  const { name } = req.query;

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
    typeof content !== "string"
  ) {
    return res.status(400).json({ error: "Invalid file name or content" });
  }

  const filePath = path.join(resDir, name);
  fs.writeFileSync(filePath, content, "utf8");

  res.json({ success: true });
});

app.listen(custom_port || 4000, () => {
  console.log(
    `Server is running at http://localhost:${
      custom_port || 4000
    }/public/index.html`
  );
});

app.use(express.static(__dirname));
