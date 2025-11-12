async function listApps() {
  const res = await fetch("/api/app/list");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to list apps");
  }
  return await res.json(); // returns { apps: [...] }
}

async function loadAppConfig(appName) {
  const res = await fetch(`/api/apps/load?name=${encodeURIComponent(appName)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load app config");
  }
  return await res.json(); // { app: "app_name", files: ["lib/p5.js", "lib/w3.js", "main.js"] }
}

const desktops = [[], [], [], []]; // list of iframewindows
let currentDesk = 0;

const iframeWindows = [];
let focusedIndex = -1;

// Utility to create floating iframe window
async function loadAppInIframe(appName, options = {}) {
  const { publicFiles = [] } = options;
  const res = await fetch(`/api/apps/load?name=${encodeURIComponent(appName)}`);
  if (!res.ok) throw new Error(`Failed to load app config for ${appName}`);
  const { files } = await res.json();

  // Create outer window div
  const win = document.createElement("div");
  win.className = "app-window";
  win.style.position = "fixed";
  win.style.top = `${50 + iframeWindows.length * 30}px`;
  win.style.left = `${80 + iframeWindows.length * 40}px`;
  win.style.width = "500px";
  win.style.height = "400px";
  win.style.background = "#fff";
  win.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  win.style.borderRadius = "10px";
  win.style.overflow = "hidden";
  win.style.zIndex = 1000 + iframeWindows.length;

  // --- Title bar ---
  const titleBar = document.createElement("div");
  titleBar.textContent = appName;
  titleBar.style.background = "#222";
  titleBar.style.color = "#fff";
  titleBar.style.padding = "6px 10px";
  titleBar.style.cursor = "move";
  titleBar.style.userSelect = "none";
  win.appendChild(titleBar);

  // --- Create iframe ---
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "calc(100% - 30px)";
  iframe.style.border = "none";
  iframe.sandbox = "allow-scripts allow-same-origin";
  win.appendChild(iframe);

  document.body.appendChild(win);

  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open();
  idoc.write(`<!DOCTYPE html><html><head></head><body></body></html>`);
  idoc.close();

  // Helper for injecting external <script>
  const injectScriptSrc = (doc, src) =>
    new Promise((resolve, reject) => {
      const s = doc.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      doc.head.appendChild(s);
    });

  // Load public files
  for (const path of publicFiles) {
    const fullPath = `/public${path.startsWith("/") ? path : `/${path}`}`;
    try {
      await injectScriptSrc(idoc, fullPath);
    } catch (e) {
      console.warn("Failed to load:", fullPath);
    }
  }

  // Load app files from backend
  for (const file of files) {
    try {
      const jsText = await readFile(file);
      const s = idoc.createElement("script");
      s.textContent = jsText;
      idoc.head.appendChild(s);
    } catch (err) {
      console.warn("Failed to load app file:", file);
    }
  }

  // --- Add to global window list ---
  const winData = { appName, win, iframe, isFullscreen: false };
  iframeWindows.push(winData);
  desktops[currentDesk].push(winData);
  focusWindow(iframeWindows.length - 1);

  // --- Enable dragging ---
  enableDrag(win, titleBar);

  // --- Enable resizing ---
  enableResize(win, iframeWindows.length - 1);

  return iframe;
}

let baseZ = 1000; // starting z-index for lowest window
let zCounter = 0; // track next z-index to assign

function focusWindow(index) {
  if (index < 0 || index >= iframeWindows.length) return;

  // Increment z-counter and assign next top level
  zCounter++;
  const topZ = baseZ + zCounter;

  // Bring the focused window to top visually
  iframeWindows[index].win.style.zIndex = topZ;

  // Update internal order (optional, for cycling)
  focusedIndex = index;

  // Adjust others’ z-index to maintain relative order
  iframeWindows.forEach((w, i) => {
    if (i !== index && !w.win.style.zIndex) {
      w.win.style.zIndex = baseZ + i;
    }
    w.win.style.border =
      i === index ? "2px solid #0096ff" : "2px solid transparent";
  });

  // Reset counter if it gets too high
  if (zCounter > 10000) {
    zCounter = 0;
    iframeWindows.forEach((w, i) => {
      w.win.style.zIndex = baseZ + i;
    });
  }
}

window.addEventListener("keydown", (e) => {
  // Require both Ctrl and Alt to be pressed
  if (!e.ctrlKey || !e.altKey) return;

  const key = e.key.toLowerCase();
  if (key === "w") {
    e.preventDefault();
    if (focusedIndex >= 0) {
      iframeWindows[focusedIndex].win.remove();
      iframeWindows.splice(focusedIndex, 1);
      if (iframeWindows.length > 0)
        focusWindow(
          (focusedIndex - 1 + iframeWindows.length) % iframeWindows.length
        );
      else focusedIndex = -1;
    }
  } else if (key === "arrowleft") {
    e.preventDefault();
    if (iframeWindows.length)
      focusWindow(
        (focusedIndex - 1 + iframeWindows.length) % iframeWindows.length
      );
  } else if (key === "arrowright") {
    e.preventDefault();
    if (iframeWindows.length)
      focusWindow((focusedIndex + 1) % iframeWindows.length);
  } else if (key === "f") {
    e.preventDefault();
    toggleFullscreen(focusedIndex);
  } else if (key === "n") {
    console.log("CurrentDesk:", currentDesk);
    for (let i = 0; i < desktops[currentDesk].length; i++) {
      let app = desktops[currentDesk][i].win;
      app.style.display = "none";
    }
    currentDesk += 1;
    currentDesk = currentDesk % desktops.length;

    for (let i = 0; i < desktops[currentDesk].length; i++) {
      let app = desktops[currentDesk][i].win;
      app.style.display = "block";
    }
  }
});

// ---- Fullscreen toggle ----
function toggleFullscreen(index) {
  if (index < 0) return;
  const w = iframeWindows[index];
  if (!w.isFullscreen) {
    w.prevStyle = {
      top: w.win.style.top,
      left: w.win.style.left,
      width: w.win.style.width,
      height: w.win.style.height,
    };
    w.win.style.top = "0";
    w.win.style.left = "0";
    w.win.style.width = "100vw";
    w.win.style.height = "100vh";
    w.isFullscreen = true;
  } else {
    const ps = w.prevStyle;
    Object.assign(w.win.style, ps);
    w.isFullscreen = false;
  }
}

// ---- Draggable support ----
function enableDrag(win, handle) {
  let offsetX,
    offsetY,
    dragging = false;
  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    x = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, y));
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  });
  window.addEventListener("mouseup", () => (dragging = false));
}

// ---- Resizable support ----
function enableResize(win, index) {
  const edges = [
    { cursor: "nw-resize", x: "left", y: "top" },
    { cursor: "ne-resize", x: "right", y: "top" },
    { cursor: "sw-resize", x: "left", y: "bottom" },
    { cursor: "se-resize", x: "right", y: "bottom" },
    { cursor: "n-resize", x: null, y: "top" },
    { cursor: "s-resize", x: null, y: "bottom" },
    { cursor: "w-resize", x: "left", y: null },
    { cursor: "e-resize", x: "right", y: null },
  ];

  const resizers = [];

  // --- Create 8 resize handles ---
  for (const { cursor, x, y } of edges) {
    const handle = document.createElement("div");
    handle.style.position = "absolute";
    handle.style.width = x && y ? "15px" : x ? "6px" : "100%";
    handle.style.height = x && y ? "15px" : y ? "6px" : "100%";
    handle.style.cursor = cursor;
    handle.style.userSelect = "none";
    handle.style.zIndex = 5;

    if (x) handle.style[x] = "0";
    if (y) handle.style[y] = "0";

    // For side handles, shrink their size
    if (!x || !y) {
      if (!x) handle.style.width = "100%";
      if (!y) handle.style.height = "100%";
    }

    win.appendChild(handle);
    resizers.push({ handle, x, y, cursor });
  }

  // --- Handle resizing ---
  let resizing = false;
  let startX, startY, startW, startH, startL, startT;
  let currentEdge = null;

  function onMouseDown(e, edge) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    currentEdge = edge;
    startX = e.clientX;
    startY = e.clientY;
    startW = win.offsetWidth;
    startH = win.offsetHeight;
    startL = win.offsetLeft;
    startT = win.offsetTop;
    document.body.style.cursor = edge.cursor;
  }

  function onMouseMove(e) {
    if (!resizing || !currentEdge) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    let newW = startW;
    let newH = startH;
    let newL = startL;
    let newT = startT;

    if (currentEdge.x === "right") newW = Math.max(200, startW + dx);
    if (currentEdge.x === "left") {
      newW = Math.max(200, startW - dx);
      newL = startL + dx;
    }
    if (currentEdge.y === "bottom") newH = Math.max(150, startH + dy);
    if (currentEdge.y === "top") {
      newH = Math.max(150, startH - dy);
      newT = startT + dy;
    }

    // Keep within screen bounds
    newW = Math.min(newW, window.innerWidth - newL);
    newH = Math.min(newH, window.innerHeight - newT);
    newL = Math.max(0, Math.min(newL, window.innerWidth - newW));
    newT = Math.max(0, Math.min(newT, window.innerHeight - newH));

    win.style.width = `${newW}px`;
    win.style.height = `${newH}px`;
    win.style.left = `${newL}px`;
    win.style.top = `${newT}px`;
  }

  function onMouseUp() {
    resizing = false;
    document.body.style.cursor = "default";
  }

  resizers.forEach(({ handle, ...edge }) => {
    handle.addEventListener("mousedown", (e) => onMouseDown(e, edge));
  });
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // --- Focus on click anywhere ---
  win.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    focusWindow(index);
  });
}
