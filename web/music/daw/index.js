const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 4000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/audio", express.static(path.join(__dirname, "res", "audio")));

let currentProject = "default";
const basePath = (...parts) =>
  path.join(__dirname, "res", "projects", currentProject, ...parts);
const safePath = (target) => {
  const resolved = path.resolve(basePath(), target);
  if (!resolved.startsWith(path.resolve(basePath())))
    throw new Error("Unsafe path");
  //   console.log(resolved);
  return resolved;
};

const walkDir = (dir) => {
  const result = [];
  const walk = (dirPath) => {
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
      const full = path.join(dirPath, entry);
      const rel = path.relative(basePath(), full);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        result.push({ type: "folder", path: rel });
        walk(full);
      } else {
        result.push({ type: "file", path: rel });
      }
    }
  };
  walk(dir);
  return result;
};

// File read
app.get("/api/file", (req, res) => {
  try {
    const file = safePath(req.query.name);
    res.sendFile(file);
  } catch {
    res.status(400).json({ error: "Invalid file path" });
  }
});

// File write
app.post("/api/file", (req, res) => {
  // console.log(req.query, req.body);
  try {
    const file = safePath(req.query.name);
    // console.log(file);
    fs.writeFileSync(file, req.body.content || "");
    res.json({ success: "saved" });
  } catch {
    res.status(400).json({ error: "Write failed" });
  }
});

function getAudioFilesRecursively(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAudioFilesRecursively(fullPath, baseDir));
    } else if (/\.(mp3|wav|ogg)$/i.test(file)) {
      // Return relative path from base directory
      results.push(path.relative(baseDir, fullPath).replace(/\\/g, "/"));
    }
  });

  return results;
}

app.get("/list-audio", (req, res) => {
  const audioDir = path.join(__dirname, "res/audio");

  try {
    const audioFiles = getAudioFilesRecursively(audioDir);
    res.json(audioFiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to read audio directory" });
  }
});

// File properties
app.post("/api/fileProperties", (req, res) => {
  try {
    const { name, newName } = req.query;
    const src = safePath(name);
    const dst = safePath(path.join(path.dirname(name), newName));
    fs.renameSync(src, dst);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Rename failed" });
  }
});

// Create file
app.post("/api/fileMethods/newFile", (req, res) => {
  try {
    // console.log(req.query);
    const file = safePath(path.join(req.query.folderPath, req.query.name));

    fs.writeFileSync(file, "");
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "New file creation failed" });
  }
});

// Copy file
app.post("/api/fileMethods/copyFile", (req, res) => {
  try {
    const src = safePath(req.query.filePath);
    const dst = safePath(req.query.newLocation);
    fs.copyFileSync(src, dst);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Copy failed" });
  }
});

// Move file
app.post("/api/fileMethods/moveFile", (req, res) => {
  try {
    const src = safePath(req.query.filePath);
    const dst = safePath(req.query.newLocation);
    fs.renameSync(src, dst);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Move failed" });
  }
});

// Delete file
app.post("/api/fileMethods/deleteFile", (req, res) => {
  try {
    const file = safePath(req.query.filePath);
    fs.unlinkSync(file);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Delete failed" });
  }
});

// // Read all files
// app.get("/api/allFiles", (req, res) => {
//   try {
//     res.json(walkDir(basePath()));
//   } catch {
//     res.status(500).json({ error: "Failed to read structure" });
//   }
// });

// New folder
app.post("/api/fileMethods/newFolder", (req, res) => {
  try {
    const dir = safePath(path.join(req.query.folderPath, req.query.name));
    fs.mkdirSync(dir, { recursive: true });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Create folder failed" });
  }
});

// Delete folder
app.post("/api/fileMethods/deleteFolder", (req, res) => {
  try {
    const dir = safePath(req.query.folderPath);
    fs.rmSync(dir, { recursive: true, force: true });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Delete folder failed" });
  }
});

// Rename folder
app.post("/api/fileMethods/renameFolder", (req, res) => {
  try {
    const src = safePath(req.query.folderPath);
    const dst = safePath(
      path.join(path.dirname(req.query.folderPath), req.query.newName)
    );
    fs.renameSync(src, dst);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Rename folder failed" });
  }
});

// File stats
app.get("/api/fileStats", (req, res) => {
  try {
    const stats = fs.statSync(safePath(req.query.name));
    res.json({
      size: stats.size,
      modified: stats.mtime,
      created: stats.ctime,
    });
  } catch {
    res.status(400).json({ error: "Stats fetch failed" });
  }
});

// Duplicate file
app.post("/api/fileMethods/duplicateFile", (req, res) => {
  try {
    const file = safePath(req.query.filePath);
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const dir = path.dirname(file);
    const newPath = path.join(dir, base + "_copy" + ext);
    fs.copyFileSync(file, newPath);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Duplicate failed" });
  }
});

// Change project
app.post("/api/changeProject", (req, res) => {
  try {
    currentProject = req.body.project || "default";
    res.json({ success: true, currentProject });
  } catch {
    res.status(400).json({ error: "Change project failed" });
  }
});

const PROJECT_BASE = path.join(__dirname, "res", "projects");

app.get("/api/allFiles", (req, res) => {
  const projectName = currentProject; // you manage this globally
  const folder = req.query.folder || ""; // e.g., "", "tracks", "automation"

  //   console.log(folder);

  const safeFolder = path.normalize(folder).replace(/^(\.\.(\/|\\|$))+/, "");
  const targetDir = path.join(PROJECT_BASE, projectName, safeFolder);

  // prevent escaping project boundaries
  if (!targetDir.startsWith(path.join(PROJECT_BASE, projectName))) {
    return res.status(400).json({ error: "Invalid folder path" });
  }

  function readTree(dirPath, basePath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(basePath, fullPath);
      if (entry.isDirectory()) {
        return {
          type: "folder",
          name: entry.name,
          path: relPath,
          children: readTree(fullPath, basePath),
        };
      } else {
        return {
          type: "file",
          name: entry.name,
          path: relPath,
        };
      }
    });
  }

  try {
    const tree = readTree(targetDir, targetDir); // relPath from here
    res.json(tree);
  } catch (err) {
    // console.log("ehjk");
    res.status(500).json({ error: "Failed to read directory" });
  }
});

app.get("/just", (req, res) => {
  res.json({ jj: "ejje" });
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
