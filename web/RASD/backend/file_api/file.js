const { generateId } = require("../random_generators");

const fs = require("fs");
const path = require("path");

class FileHandler {
  constructor(path) {
    this.id = generateId("file");
    this.path = path;
    this.filehandler = null;
    this.type = "text"; // text, js, config, csv, json, random
  }
}

function getFileType(filePath) {
  const ext = path.extname(filePath).slice(1);
  if (!ext) return "text";
  if (["txt", "md", "json", "js", "html", "css"].includes(ext)) return "text";
  if (["jpg", "png", "gif"].includes(ext)) return "image";
  if (["mp4", "mov"].includes(ext)) return "video";
  return "binary";
}

function getFile(which_path, req, file_handlers) {
  const { name, permission } = req.query;
  let h;
  if (Array.isArray(file_handlers)) {
    h = file_handlers.find((e) => e.path === name);
  } else {
    console.error("file_handlers is not an array:", file_handlers);
  }
  if (h) {
    return h;
  }
  if (!name || name.includes("..")) {
    return null;
  }

  const filePath = path.join(which_path, name);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return null;
  }

  let handler = new FileHandler(name);
  // its not necessary step until buffer is preffered
  // if (permission == "rw") handler.filehandler = fs.openSync(filePath, "r+");
  // else handler.filehandler = fs.openSync(filePath, "r");

  handler.type = getFileType(filePath);
  file_handlers.push(handler);
  return handler;
}

module.exports = {
  FileHandler,
  getFile,
  getFileType,
};
