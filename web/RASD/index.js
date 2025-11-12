const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const {
  getFile,
  getFileType,
  FileHandler,
} = require("./backend/file_api/file");
const { getFolder, DirHandler } = require("./backend/file_api/dir");
const { deny } = require("./backend/helper");
const { Pipe, getPipe } = require("./backend/file_api/pipe");
const app = express();

app.use(bodyParser.text()); // accept plain text for files_order.txt
app.use(express.json());

app.use(express.static(__dirname));
app.use(express.raw({ type: "*/*", limit: "50mb" })); // accepts all types as raw
// console.log(folder_name);

let dir_name = `res`;
const resDir = path.join(__dirname, dir_name);
const app_dir = path.join(resDir, "apps");
const app_private_dir = path.join(resDir, "apps_private");

let file_handlers = [];
let dir_handlers = [];
let pipe_handlers = [];

/*
# File functions
#
#
*/

app.get("/api/file/writePipe", (req, res) => {
  const { name, data } = req.query;
  if (!name || data === undefined) {
    return res.status(400).send({ error: "Missing pipe name or data" });
  }

  const pipe = getPipe(name, pipe_handlers);
  pipe.write(data);

  res.send({
    message: `Data added to pipe "${name}"`,
    length: pipe.length(),
  });
});

// read from pipe
app.get("/api/file/readPipe", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).send({ error: "Missing pipe name" });

  const pipe = getPipe(name, pipe_handlers);
  const data = pipe.read();

  if (data === undefined) {
    return res.send({ message: `Pipe "${name}" is empty` });
  }

  res.send({ data, length: pipe.length() });
});

app.get("/api/file/get", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  res.send({
    id: handler.id,
    path: handler.path,
    type: handler.type,
  });
});

app.get("/api/private/file/get", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  res.send({
    id: handler.id,
    path: handler.path,
    type: handler.type,
  });
});

app.get("/api/file/create", (req, res) => {
  const { name } = req.query;
  if (!name) return deny(res, "E_MISSING_ARG", "Missing file name");

  const filePath = path.join(app_dir, name);

  // Create the file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, "", "utf8"); // empty file
    } catch (err) {
      return deny(res, "E_FS_ERROR", err.message);
    }
  }

  // Create a handler
  const handler = new FileHandler(name);
  handler.type = getFileType(filePath);

  // Add to file_handlers
  file_handlers.push(handler);

  res.json({
    id: handler.id,
    path: handler.path,
    type: handler.type,
  });
});

// Private file create
app.get("/api/private/file/create", (req, res) => {
  const { name } = req.query;
  if (!name) return deny(res, "E_MISSING_ARG", "Missing file name");

  const filePath = path.join(app_private_dir, name);

  // Create the file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, "", "utf8"); // empty file
    } catch (err) {
      return deny(res, "E_FS_ERROR", err.message);
    }
  }

  // Create a handler
  const handler = new FileHandler(name);
  handler.type = getFileType(filePath);

  // Add to file_handlers
  file_handlers.push(handler);

  res.json({
    id: handler.id,
    path: handler.path,
    type: handler.type,
  });
});

app.get("/api/file/read", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  const filePath = path.join(app_dir, handler.path);
  const data = fs.readFileSync(filePath, "utf8");
  if (!data) return deny(res, "E_PERMISSION_DENIED", "Cannot read file");
  res.send({
    data,
  });
});

app.get("/api/private/file/read", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  const filePath = path.join(app_private_dir, handler.path);
  const data = fs.readFileSync(filePath, "utf8");
  if (!data) return deny(res, "E_PERMISSION_DENIED", "Cannot read file");
  res.send({
    data,
  });
});

app.post("/api/file/write", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  const filePath = path.join(app_dir, handler.path);
  let { content } = req.body;
  fs.writeFileSync(filePath, content, "utf8");
  res.json({ success: true });
});

app.post("/api/private/file/write", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  const filePath = path.join(app_private_dir, handler.path);
  let { content } = req.body;
  fs.writeFileSync(filePath, content, "utf8");
  res.json({ success: true });
});

app.get("/api/file/rename", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { new_name } = req.query;
  if (!new_name)
    return deny(res, "E_PERMISSION_DENIED", "new name not provided");

  const oldPath = path.join(app_dir, handler.path);
  const newPath = path.join(app_dir, new_name);

  try {
    fs.renameSync(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", "Cannot rename file");
  }
});

app.get("/api/private/file/rename", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { new_name } = req.query;
  if (!new_name)
    return deny(res, "E_PERMISSION_DENIED", "new name not provided");

  const oldPath = path.join(app_private_dir, handler.path);
  const newPath = path.join(app_private_dir, new_name);

  try {
    fs.renameSync(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/file/delete", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const filePath = path.join(app_dir, handler.path);

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/private/file/delete", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const filePath = path.join(app_private_dir, handler.path);

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/file/move", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { new_path } = req.query;
  if (!new_path)
    return deny(res, "E_PERMISSION_DENIED", "new name not provided");

  const oldPath = path.join(app_dir, handler.path);
  const destPath = path.join(app_dir, new_path);

  try {
    fs.renameSync(oldPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/private/file/move", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { new_path } = req.query;
  if (!new_path)
    return deny(res, "E_PERMISSION_DENIED", "new name not provided");

  const oldPath = path.join(app_private_dir, handler.path);
  const destPath = path.join(app_private_dir, new_path);

  try {
    fs.renameSync(oldPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/file/copy", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { dest_path } = req.query;
  if (!dest_path)
    return deny(res, "E_PERMISSION_DENIED", "destination path not provided");

  const srcPath = path.join(app_dir, handler.path);
  const destPath = path.join(app_dir, dest_path);

  try {
    fs.copyFileSync(srcPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

app.get("/api/private/file/copy", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const { dest_path } = req.query;
  if (!dest_path)
    return deny(res, "E_PERMISSION_DENIED", "destination path not provided");

  const srcPath = path.join(app_private_dir, handler.path);
  const destPath = path.join(app_private_dir, dest_path);

  try {
    fs.copyFileSync(srcPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_PERMISSION_DENIED", err.message);
  }
});

/*
# Folder Functions
#
#
*/

app.get("/api/folder/create", (req, res) => {
  const { name } = req.query;
  if (!name) return deny(res, "E_PERMISSION_DENIED", "Cannot create dir");

  const fullPath = path.join(app_dir, name);

  try {
    fs.mkdirSync(fullPath, { recursive: true });
    const handler = new DirHandler(name);
    dir_handlers.push(handler);
    res.json({ id: handler.id, path: handler.path });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/private/folder/create", (req, res) => {
  const { name } = req.query;
  if (!name) return deny(res, "E_PERMISSION_DENIED", "Cannot create dir");

  const fullPath = path.join(app_private_dir, name);
  try {
    fs.mkdirSync(fullPath, { recursive: true });
    const handler = new DirHandler(name);
    dir_handlers.push(handler);
    res.json({ id: handler.id, path: handler.path });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/folder/delete", (req, res) => {
  const handler = getFolder(app_dir, req, dir_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find dir");

  const fullPath = path.join(app_dir, req.query.name);

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/private/folder/delete", (req, res) => {
  const handler = getFolder(app_private_dir, req, dir_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find dir");

  const fullPath = path.join(app_private_dir, req.query.name);

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/folder/move", (req, res) => {
  const { old_path, new_path } = req.query;
  if (!old_path || !new_path)
    return deny(res, "E_INVALID_PATH", "Missing source or destination path");

  const srcPath = path.join(app_dir, old_path);
  const destPath = path.join(app_dir, new_path);

  try {
    fs.renameSync(srcPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/private/folder/move", (req, res) => {
  const { old_path, new_path } = req.query;
  if (!old_path || !new_path)
    return deny(res, "E_INVALID_PATH", "Missing source or destination path");

  const srcPath = path.join(app_private_dir, old_path);
  const destPath = path.join(app_private_dir, new_path);

  try {
    fs.renameSync(srcPath, destPath);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

function getDirTree(dir, level = 1, maxLevel = Infinity) {
  if (level > maxLevel) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);
    const item = {
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
    };
    if (entry.isDirectory()) {
      item.children = getDirTree(fullPath, level + 1, maxLevel);
    }
    return item;
  });
}

app.get("/api/folder/tree", (req, res) => {
  const { dir_path = ".", level = 3 } = req.query;
  const fullPath = path.join(app_dir, dir_path);

  try {
    const tree = getDirTree(fullPath, 1, parseInt(level));
    // console.log(tree);
    res.json({ success: true, data: tree });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/private/folder/tree", (req, res) => {
  const { dir_path = ".", level = 3 } = req.query;
  const fullPath = path.join(app_private_dir, dir_path);

  try {
    const tree = getDirTree(fullPath, 1, parseInt(level));
    res.json({ success: true, data: tree });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/folder/get", (req, res) => {
  const handler = getFolder(app_dir, req, dir_handlers);
  if (!handler)
    return deny(res, "E_PERMISSION_DENIED", "Cannot find directory");

  res.json({ id: handler.id, path: handler.path });
});

app.get("/api/private/folder/get", (req, res) => {
  const handler = getFolder(app_private_dir, req, dir_handlers);
  if (!handler)
    return deny(res, "E_PERMISSION_DENIED", "Cannot find directory");

  res.json({ id: handler.id, path: handler.path });
});

// media

const mimeTypes = {
  ".txt": "text/plain",
  ".html": "text/html",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  // add more as needed
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

app.get("/api/file/readByte", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const filePath = path.join(app_dir, handler.path);

  try {
    const data = fs.readFileSync(filePath); // returns Buffer
    const contentType = getMimeType(filePath) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.send(data);
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.get("/api/private/file/readByte", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const filePath = path.join(app_private_dir, handler.path);

  try {
    const data = fs.readFileSync(filePath); // returns Buffer
    const contentType = getMimeType(filePath) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.send(data);
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.post("/api/file/writeByte", (req, res) => {
  const handler = getFile(app_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");
  const filePath = path.join(app_dir, handler.path);

  try {
    // req.body should be an ArrayBuffer / Uint8Array
    const buffer = Buffer.from(req.body);
    fs.writeFileSync(filePath, buffer);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

app.post("/api/private/file/writeByte", (req, res) => {
  const handler = getFile(app_private_dir, req, file_handlers);
  if (!handler) return deny(res, "E_PERMISSION_DENIED", "Cannot find file");

  const filePath = path.join(app_private_dir, handler.path);

  try {
    const buffer = Buffer.from(req.body);
    fs.writeFileSync(filePath, buffer);
    res.json({ success: true });
  } catch (err) {
    deny(res, "E_FS_ERROR", err.message);
  }
});

// apps
app.get("/api/app/list", (req, res) => {
  try {
    const entries = fs.readdirSync(app_dir, { withFileTypes: true });
    const folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    res.send({ apps: folders });
  } catch (err) {
    console.error("Error listing apps:", err);
    res.status(500).send({ error: "Failed to list apps" });
  }
});

app.get("/api/apps/load", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).send({ error: "Missing app name" });

  const appPath = path.join(app_dir, name);
  const configPath = path.join(appPath, "config");

  if (!fs.existsSync(appPath)) {
    return res.status(404).send({ error: `App "${name}" not found` });
  }
  if (!fs.existsSync(configPath)) {
    return res
      .status(404)
      .send({ error: `Config file missing for app "${name}"` });
  }

  try {
    const configLines = fs
      .readFileSync(configPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")); // skip comments & empty lines

    const filesToLoad = [];

    for (const line of configLines) {
      const fullPath = path.join(appPath, line);

      // Case 1: it's a directory (like "lib/")
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        const jsFiles = fs
          .readdirSync(fullPath)
          .filter((f) => f.endsWith(".js"))
          .map((f) => `${line}${f}`); // keep relative path (e.g., "lib/p5.js")
        filesToLoad.push(...jsFiles);
      }
      // Case 2: direct file path
      else if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        filesToLoad.push(line);
      }
      // Case 3: not found
      else {
        console.warn(`Warning: ${line} not found in ${appPath}`);
      }
    }

    res.send({
      app: name,
      files: filesToLoad,
    });
  } catch (err) {
    console.error("Error loading app:", err);
    res.status(500).send({ error: "Failed to load app configuration" });
  }
});

// --- API to list all background files ---
const background_dir = path.join(__dirname, "res", "background");

app.get("/api/background/list", (req, res) => {
  try {
    const files = fs
      .readdirSync(background_dir)
      .filter(
        (f) =>
          f !== "config" && fs.statSync(path.join(background_dir, f)).isFile()
      );
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API to read a file as bytes ---
app.get("/api/background/readByte", (req, res) => {
  const { name } = req.query;
  if (!name || name.includes("..")) {
    return res.status(400).json({ error: "Invalid file name" });
  }

  const filePath = path.join(background_dir, name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const data = fs.readFileSync(filePath);
    const contentType = getMimeType(filePath);
    res.setHeader("Content-Type", contentType);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/background/config", (req, res) => {
  const configPath = path.join(background_dir, "config");

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: "Config file not found" });
  }

  try {
    const text = fs.readFileSync(configPath, "utf-8");

    // Parse simple key-value config
    const config = {};
    text.split("\n").forEach((line) => {
      const match = line.trim().match(/^(\w+)\s+(\d+)$/);
      if (match) {
        const key = match[1];
        let value = parseInt(match[2]);
        config[key] = value;
      }
    });

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Final

// app.use("/res", express.static(path.join(__dirname, "res")));

let custom_port = 4000;
app.listen(custom_port, () => {
  console.log(
    `Server is running at http://localhost:${custom_port}/public/index.html`
  );
});
