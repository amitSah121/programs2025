class FileHandler {
  constructor(id, path, type) {
    this.id = id;
    this.path = path;
    this.type = type;
  }
}

class DirHandler {
  constructor(id, path) {
    this.id = id;
    this.path = path;
  }
}

/*
Note we can do 
const iframe = document.createElement("iframe");
iframe.src = "app.html";
iframe.onload = () => {
  iframe.contentWindow.appName = "myApp/";
};
document.body.appendChild(iframe);

*/

async function getFile(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(`/api/file/get?name=${encodeURIComponent(truePath)}`);
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { id, path, type } = await res.json();
  const handler = new FileHandler(
    id,
    path.slice(window.appName.length + 1),
    type
  );
  return handler;
}

async function getFilePrivate(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/get?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { id, path, type } = await res.json();
  const handler = new FileHandler(
    id,
    path.slice(window.appName.length + 1),
    type
  );
  return handler;
}

async function createFile(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/file/create?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { id, path, type } = await res.json();
  const handler = new FileHandler(
    id,
    path.slice(window.appName.length + 1),
    type
  );
  return handler;
}

async function createFilePrivate(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/create?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { id, path, type } = await res.json();
  const handler = new FileHandler(
    id,
    path.slice(window.appName.length + 1),
    type
  );
  return handler;
}

/*
Note this can be done

(async () => {
  const content = await readFile("notes.txt");
  console.log(content);
})();
*/

async function readFile(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/file/read?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { data } = await res.json();
  return data;
}

async function readFilePrivate(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/read?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) {
    throw new Error("Failed to get file handler");
  }
  const { data } = await res.json();
  return data;
}

// -------------------------------
// 📁 FILE API HELPERS
// -------------------------------

// Rename file
async function renameFile(filePath, new_name) {
  const truePath = `${window.appName}/${filePath}`;
  const truePathDest = `${window.appName}/${new_name}`;
  const res = await fetch(
    `/api/file/rename?name=${encodeURIComponent(
      truePath
    )}&new_name=${encodeURIComponent(truePathDest)}`
  );
  if (!res.ok) throw new Error("Failed to rename file");
  return await res.json();
}

async function renameFilePrivate(filePath, new_name) {
  const truePath = `${window.appName}/${filePath}`;
  const truePathDest = `${window.appName}/${new_name}`;
  const res = await fetch(
    `/api/private/file/rename?name=${encodeURIComponent(
      truePath
    )}&new_name=${encodeURIComponent(truePathDest)}`
  );
  if (!res.ok) throw new Error("Failed to rename private file");
  return await res.json();
}

// Delete file
async function deleteFile(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/file/delete?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to delete file");
  return await res.json();
}

async function deleteFilePrivate(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/delete?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to delete private file");
  return await res.json();
}

// Move file
async function moveFile(old_path, new_path) {
  const truePath = `${window.appName}/${old_path}`;
  const truePathDest = `${window.appName}/${new_path}`;
  const res = await fetch(
    `/api/file/move?name=${encodeURIComponent(
      truePath
    )}&new_path=${truePathDest}`
  );
  if (!res.ok) throw new Error("Failed to move file");
  return await res.json();
}

async function moveFilePrivate(old_path, new_path) {
  const truePath = `${window.appName}/${old_path}`;
  const truePathDest = `${window.appName}/${new_path}`;
  const res = await fetch(
    `/api/private/file/move?name=${encodeURIComponent(
      truePath
    )}&new_path=${truePathDest}`
  );
  if (!res.ok) throw new Error("Failed to move private file");
  return await res.json();
}

// Copy file
async function copyFile(src_path, dest_path) {
  const truePath = `${window.appName}/${src_path}`;
  const truePathDest = `${window.appName}/${dest_path}`;
  const res = await fetch(
    `/api/file/copy?name=${encodeURIComponent(
      truePath
    )}&dest_path=${truePathDest}`
  );
  if (!res.ok) throw new Error("Failed to copy file");
  return await res.json();
}

async function copyFilePrivate(src_path, dest_path) {
  const truePath = `${window.appName}/${src_path}`;
  const truePathDest = `${window.appName}/${dest_path}`;
  const res = await fetch(
    `/api/private/file/copy?name=${encodeURIComponent(
      truePath
    )}&dest_path=${truePathDest}`
  );
  if (!res.ok) throw new Error("Failed to copy private file");
  return await res.json();
}

// Write to a pipe
async function writePipe(pipeName, data) {
  const res = await fetch(
    `/api/file/writePipe?name=${encodeURIComponent(
      pipeName
    )}&data=${encodeURIComponent(data)}`,
    { method: "GET" } // using GET because your API currently uses GET
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to write to pipe");
  }

  return await res.json(); // returns { message, length }
}

// Read from a pipe
async function readPipe(pipeName) {
  const res = await fetch(
    `/api/file/readPipe?name=${encodeURIComponent(pipeName)}`,
    { method: "GET" }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to read from pipe");
  }

  return await res.json(); // returns { data, length } or { message }
}

// Write file
async function writeFile(filePath, content) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/file/write?name=${encodeURIComponent(truePath)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to write file");
  }
  return await res.json();
}

async function writeFilePrivate(filePath, content) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/write?name=${encodeURIComponent(truePath)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to write private file");
  }
  return await res.json();
}

// ---------------------------------
// 📂 DIRECTORY API HELPERS
// ---------------------------------

// Get directory tree
async function getDirTree() {
  const res = await fetch(`/api/folder/tree`);
  if (!res.ok) throw new Error("Failed to fetch directory tree");
  const { data } = await res.json();
  return data; // should be an array or tree of DirHandler-like objects
}

async function getDirTreePrivate() {
  const res = await fetch(`/api/private/folder/tree`);
  if (!res.ok) throw new Error("Failed to fetch private directory tree");
  const { data } = await res.json();
  return data;
}

// Create directory
async function createDir(dirpath, createRecursive = false) {
  const truePath = `${window.appName}/${dirpath}`;
  const res = await fetch(
    `/api/folder/create?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to create directory");
  let { id, path } = await res.json();
  let handler = new DirHandler(id, path.slice(window.appName.length + 1));
  return handler;
}

async function createDirPrivate(dirpath, createRecursive = false) {
  const truePath = `${window.appName}/${dirpath}`;
  const res = await fetch(
    `/api/private/folder/create?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to create private directory");
  let { id, path } = await res.json();
  let handler = new DirHandler(id, path.slice(window.appName.length + 1));
  return handler;
}

// Delete directory
async function deleteDir(dirpath, recursive = false) {
  const truePath = `${window.appName}/${dirpath}`;
  const res = await fetch(
    `/api/folder/delete?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to delete directory");
  return await res.json();
}

async function deleteDirPrivate(dirpath, recursive = false) {
  const truePath = `${window.appName}/${dirpath}`;
  const res = await fetch(
    `/api/private/folder/delete?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to delete private directory");
  return await res.json();
}

// Rename directory
async function moveDir(oldPath, newPath) {
  const truePath = `${window.appName}/${oldPath}`;
  const truePathDest = `${window.appName}/${newPath}`;

  const res = await fetch(
    `/api/folder/move?old_path=${encodeURIComponent(
      truePath
    )}&new_path=${encodeURIComponent(truePathDest)}`
  );
  if (!res.ok) throw new Error("Failed to rename directory");
  return await res.json();
}

async function moveDirPrivate(oldPath, newPath) {
  const truePath = `${window.appName}/${oldPath}`;
  const truePathDest = `${window.appName}/${newPath}`;

  const res = await fetch(
    `/api/private/folder/move?old_path=${encodeURIComponent(
      truePath
    )}&new_path=${encodeURIComponent(truePathDest)}`
  );
  if (!res.ok) throw new Error("Failed to rename private directory");
  return await res.json();
}

// media

// Read file from public space
async function readFileBytes(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/file/readByte?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to read file");

  const blob = await res.blob(); // convert to Blob for binary files
  return blob;
}

// Read file from private space
async function readFileBytesPrivate(filePath) {
  const truePath = `${window.appName}/${filePath}`;
  const res = await fetch(
    `/api/private/file/readByte?name=${encodeURIComponent(truePath)}`
  );
  if (!res.ok) throw new Error("Failed to read file");

  const blob = await res.blob(); // convert to Blob for binary files
  return blob;
}

async function writeFileByte(filePath, byteArray) {
  const truePath = `${window.appName}/${filePath}`;

  const res = await fetch(
    `/api/file/writeByte?name=${encodeURIComponent(truePath)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: byteArray, // ArrayBuffer, Uint8Array, or Blob
    }
  );

  if (!res.ok) {
    throw new Error("Failed to write file");
  }

  const data = await res.json();
  return data.success;
}

async function writeFileBytePrivate(filePath, byteArray) {
  const truePath = `${window.appName}/${filePath}`;

  const res = await fetch(
    `/api/private/file/writeByte?name=${encodeURIComponent(truePath)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: byteArray,
    }
  );

  if (!res.ok) {
    throw new Error("Failed to write file");
  }

  const data = await res.json();
  return data.success;
}
