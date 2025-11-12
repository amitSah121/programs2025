const fs = require("fs");
const path = require("path");
const { generateId } = require("../random_generators.js");

class DirHandler {
  constructor(path) {
    this.id = generateId("dir");
    this.path = path;
    this.dirhandler = null;
  }
}

function getFolder(which_path, req, dir_handlers) {
  const { name } = req.query;

  let h;
  if (Array.isArray(dir_handlers)) {
    h = dir_handlers.find((e) => e.path === name);
  } else {
    console.error("dir_handlers is not an array:", file_handlers);
  }
  if (h) {
    return h;
  }

  if (!name || name.includes("..")) {
    return null;
  }

  const dirpath = path.join(which_path, name);

  if (!fs.existsSync(dirpath)) {
    return null;
  }

  const stats = fs.statSync(dirpath);

  if (!stats.isDirectory()) {
    return null;
  }

  let handler = new DirHandler(name);
  // its not necessary step until buffer is preffered
  // if (permission == "rw") handler.filehandler = fs.openSync(dirpath, "r+");
  // else handler.filehandler = fs.openSync(dirpath, "r");
  dir_handlers.push(handler);
  return handler;
}

module.exports = {
  DirHandler,
  getFolder,
};
