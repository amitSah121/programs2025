async function loadTrackFiles() {
  const explorer = document.getElementById("sidebar-elements");
  explorer.innerHTML = ""; // Clear previous

  //   console.log(await (await fetch("/api/allFiles")).json());
  const res = await fetch("/api/allFiles?folder=tracks");
  const data = await res.json();
  //   console.log(data);

  function createList(items) {
    const ul = document.createElement("ul");
    ul.classList.add("ul");
    ul.classList.add("w3-small");
    ul.classList.add("w3-margin-left");

    items.forEach((item) => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";

      if (item.type === "folder") {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = `📁 ${item.name}`;

        // ✅ Attach contextmenu to summary
        summary.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          showLeftContextMenu(e.pageX, e.pageY, item);
        });

        details.appendChild(summary);
        details.appendChild(createList(item.children || []));
        li.appendChild(details);
      } else {
        li.textContent = `🎵 ${item.name}`;

        // ✅ Attach contextmenu to file li
        li.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          showLeftContextMenu(e.pageX, e.pageY, item);
        });

        li.onclick = () => openNoteFile(item.path, li);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  const listTree = createList(data);

  //   console.log(listTree);
  explorer.appendChild(listTree);
}

async function openNoteFile(path, li) {
  const p = document.querySelectorAll("#noteMatrixView #sidebar-elements li");
  console.log(p);
  p.forEach((x) => x.classList.remove("w3-light-grey"));
  li.classList.add("w3-light-grey");
  selectedFile = [li, path];
  await loadNoteFile(path);
  // console.log("Opening:", path);
}

loadTrackFiles();

const increase_sidebar_width = () => {
  let sidebar = document.querySelector("#l-sidebar");
  let editor = document.querySelector("#noteMatrixView #editor");

  for (let i = 1; i <= 8; i++) {
    let currentClass = `l${i}`;
    if (sidebar.classList.contains(currentClass)) {
      if (i < 5) {
        sidebar.classList.remove(currentClass);
        sidebar.classList.add(`l${i + 1}`);

        editor.classList.remove(`l${10 - i}`);
        editor.classList.add(`l${10 - i - 1}`);
      }
      break;
    }
  }
};

const decrease_sidebar_width = () => {
  let sidebar = document.querySelector("#l-sidebar");
  let editor = document.querySelector("#noteMatrixView #editor");

  for (let i = 1; i <= 8; i++) {
    let currentClass = `l${i}`;
    if (sidebar.classList.contains(currentClass)) {
      if (i > 2) {
        sidebar.classList.remove(currentClass);
        sidebar.classList.add(`l${i - 1}`);

        editor.classList.remove(`l${10 - i}`);
        editor.classList.add(`l${10 - i + 1}`);
      }
      break;
    }
  }
};

document.getElementById("l-sidebar").oncontextmenu = (e) => {
  if (e.target === e.currentTarget) {
    e.preventDefault();
    showLeftContextMenu(e.pageX, e.pageY, null); // null → root
  }
};

let leftContextTarget = null;

function showLeftContextMenu(x, y, item) {
  const menu = document.getElementById("leftContextMenu");
  leftContextTarget = item;

  // Show/hide options
  document.querySelector("#leftContextMenu #newFile").style.display =
    item?.type === "file" ? "none" : "block";
  document.querySelector("#leftContextMenu #newFolder").style.display =
    item?.type === "file" ? "none" : "block";
  document.querySelector("#leftContextMenu #deleteItem").style.display = item
    ? "block"
    : "none";
  document.querySelector("#leftContextMenu #renameItem").style.display = item
    ? "block"
    : "none";

  // Show menu
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

// Hide on click outside
document.addEventListener("click", () => {
  document.getElementById("leftContextMenu").style.display = "none";
});

document.querySelector("#noteMatrixView #newFile").onclick = () => {
  openNameModal("newFile", leftContextTarget);
};

document.querySelector("#noteMatrixView #newFolder").onclick = () => {
  openNameModal("newFolder", leftContextTarget);
};

document.querySelector("#noteMatrixView #deleteItem").onclick = async () => {
  if (!leftContextTarget) return;

  const isFolder = leftContextTarget.type === "folder";
  const confirmText = `Are you sure you want to delete this ${
    isFolder ? "folder" : "file"
  }: "${leftContextTarget.name}"?`;

  if (!confirm(confirmText)) return;

  //   console.log(leftContextTarget);

  const endpoint = isFolder
    ? `/api/fileMethods/deleteFolder?folderPath=${encodeURIComponent(
        "tracks/" + leftContextTarget.path
      )}`
    : `/api/fileMethods/deleteFile?filePath=${encodeURIComponent(
        "tracks/" + leftContextTarget.path
      )}`;

  fetch(endpoint, { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadTrackFiles(); // refresh view
        loadTrackFilesTl();
      } else {
        alert("Error: " + data.error);
      }
    });
};

document.querySelector("#noteMatrixView #renameItem").onclick = () => {
  if (!leftContextTarget) return;
  openNameModal(
    leftContextTarget.type === "folder" ? "renameFolder" : "renameFile",
    leftContextTarget
  );
};

let nameModalAction = null;
let nameModalTarget = null;

function openNameModal(action, target = null) {
  // console.log("I am kk");
  nameModalAction = action; // "newFile", "newFolder", "renameFile", "renameFolder"
  nameModalTarget = target;

  document.querySelector("#noteMatrixView #nameModalTitle").textContent = {
    newFile: "Create New File",
    newFolder: "Create New Folder",
    renameFile: "Rename File",
    renameFolder: "Rename Folder",
  }[action];

  document.querySelector("#noteMatrixView #nameModalLabel").textContent = {
    newFile: "File name:",
    newFolder: "Folder name:",
    renameFile: "New file name:",
    renameFolder: "New folder name:",
  }[action];

  document.querySelector("#noteMatrixView #nameModalInput").value =
    action.startsWith("rename") ? target.name : "";

  document.querySelector("#noteMatrixView #nameModal").style.display = "block";
}

function closeNameModal() {
  document.querySelector("#noteMatrixView #nameModal").style.display = "none";
  nameModalAction = null;
  nameModalTarget = null;
}

function confirmNameModal() {
  const inputName = document
    .querySelector("#noteMatrixView #nameModalInput")
    .value.trim();
  if (!inputName) return alert("Please enter a valid name.");

  let url = "";
  let method = "POST";

  const path = "tracks/" + (nameModalTarget?.path || "");

  //   console.log(path, inputName);

  switch (nameModalAction) {
    case "newFile":
      url = `/api/fileMethods/newFile?name=${encodeURIComponent(
        inputName
      )}&folderPath=${encodeURIComponent(path)}`;
      break;
    case "newFolder":
      url = `/api/fileMethods/newFolder?name=${encodeURIComponent(
        inputName
      )}&folderPath=${encodeURIComponent(path)}`;
      break;
    case "renameFile":
    case "renameFolder":
      url = `/api/fileMethods/renameFolder?folderPath=${encodeURIComponent(
        path
      )}&newName=${encodeURIComponent(inputName)}`;
      break;
    default:
      return alert("Unknown action");
  }

  fetch(url, { method })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadTrackFiles();
        loadTrackFilesTl();
        closeNameModal();
      } else {
        alert("Error: " + data.error);
      }
    });
}

let modifiers = {
  shift: false,
  ctrl: false,
  a: false,
};

// Global key tracking
document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") modifiers.shift = true;
  if (e.key === "Control") modifiers.ctrl = true;
  if (e.key.toLowerCase() === "a") modifiers.a = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") modifiers.shift = false;
  if (e.key === "Control") modifiers.ctrl = false;
  if (e.key.toLowerCase() === "a") modifiers.a = false;
});

let mynumoptions = () => {
  document.querySelectorAll(".my-num-options").forEach((el) => {
    let startY = null;
    let original = 0;
    /* to add custom event listener 
    el.addEventListener("note-released", (e) => {
       console.log("Custom note-released event received:", e.detail);
    });
     */

    el.addEventListener("mousedown", (e) => {
      const targetEl = el; // keep a reference to the clicked element

      const onMouseUp = (e2) => {
        const customEvent = new CustomEvent("note-received", {
          detail: {
            originalEvent: e2,
            from: targetEl,
            value: targetEl.dataset.value,
          },
          bubbles: true,
        });
        targetEl.dispatchEvent(customEvent);

        // Clean up the global listener
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mouseup", onMouseUp);

      e.preventDefault();
      startY = e.clientY;
      original = parseFloat(el.dataset.value || el.innerText);

      const moveHandler = (moveEvent) => {
        const dy = parseInt((startY - moveEvent.clientY) / 15);
        let step = 1;

        // if (modifiers.a && modifiers.ctrl && modifiers.shift) step = 0.001;
        // else if (modifiers.a && modifiers.shift) step = 100;
        // else
        if (modifiers.ctrl && modifiers.shift) step = 0.01;
        else if (modifiers.ctrl) step = 0.1;
        else if (modifiers.shift) step = 10;

        const newValue = original + dy * step;
        el.dataset.value = newValue.toFixed(3).replace(/\.?0+$/, "");
        el.innerText = el.dataset.value;
      };

      const upHandler = () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);
    });
  });
};
mynumoptions();

let myenumoptions = () => {
  document.querySelectorAll(".my-enum-options").forEach((el) => {
    el.addEventListener("click", (e) => {
      const options = JSON.parse(el.dataset.options || "[]");
      const rect = el.getBoundingClientRect();

      const modal = document.createElement("div");
      modal.className = "w3-card w3-white w3-small";
      modal.style.position = "absolute";
      modal.style.left = `${rect.left}px`;
      modal.style.top = `${rect.bottom + 5}px`;
      modal.style.zIndex = 1000;
      modal.style.maxHeight = "200px";
      modal.style.overflowY = "auto";

      const input = document.createElement("input");
      input.className = "w3-input w3-border w3-margin-bottom";
      input.placeholder = "Search...";
      modal.appendChild(input);

      const list = document.createElement("ul");
      list.className = "w3-ul";
      modal.appendChild(list);

      const updateList = (query = "") => {
        list.innerHTML = "";
        options
          .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
          .forEach((opt) => {
            const li = document.createElement("li");
            li.className = "w3-hover-light-grey";
            li.innerText = opt;
            li.onclick = () => {
              el.dataset.value = opt;
              el.innerText = opt;
              const customEvent = new CustomEvent("note-received", {
                detail: { originalEvent: e, value: el.dataset.value },
                bubbles: true, // optional: lets parent elements listen too
              });
              el.dispatchEvent(customEvent);
              document.body.removeChild(modal);
            };
            list.appendChild(li);
          });
      };

      updateList();

      input.addEventListener("input", () => updateList(input.value));

      document.body.appendChild(modal);

      // Dismiss when clicking outside
      const dismiss = (ev) => {
        if (!modal.contains(ev.target)) {
          try {
            document.body.removeChild(modal);
          } catch (e) {}
          document.removeEventListener("click", dismiss);
        }
      };
      setTimeout(() => document.addEventListener("click", dismiss), 0);
    });
  });
};
myenumoptions();

const rows = 8;
const columns = 32;
const container = document.getElementById("noteMatrixGrid");
let focusedCell = null;

function setupGrid(rows, columns) {
  container.innerHTML = "";
  container.style.position = "relative";
  container.style.display = "grid";
  const currentWidth = parseFloat(getComputedStyle(container).width);
  container.style.width = currentWidth * 2 + "px";
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 40px)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.row = row;
      cell.dataset.column = col;
      cell.style.border = "1px solid #ccc";
      cell.style.position = "relative";
      cell.style.overflow = "hidden";

      cell.addEventListener("click", (e) => {
        if (e.ctrlKey) return; // Ignore if ctrl+click (reserved for delete)

        const existing = [...container.querySelectorAll(".note-block")].some(
          (n) => {
            return n.dataset.row == row && n.dataset.column == col;
          }
        );
        if (!existing) {
          // console.log("kk");
          createNote(row, col); // Default values
        }
      });

      container.appendChild(cell);
    }
  }
}

const noteLabels = (() => {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const pianoNotes = [];
  for (let octave = 0; octave <= 8; octave++) {
    for (const name of noteNames) {
      pianoNotes.push(`${name}${octave}`);
    }
  }
  // Slice to standard piano range (A0–C8)
  const fullPiano = pianoNotes.slice(
    pianoNotes.indexOf("A0"),
    pianoNotes.indexOf("C8") + 1
  );
  const semitones = {
    maj3: 4, //maj3
    min3: 3, // min3
    perf5: 7, // perf5
    maj7: 11, // maj7
    dom7: 10, //dom7
    maj9: 14, // maj9
    dom9: 14, // dom9
  };

  function noteToMidi(note) {
    const name = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    return octave * 12 + noteNames.indexOf(name);
  }

  function midiToNote(midiNum) {
    const octave = Math.floor(midiNum / 12);
    const name = noteNames[midiNum % 12];
    return `${name}${octave}`;
  }

  // Generate chord types
  const chordTypes = {
    t: ["maj3", "perf5"], // triad major
    m7: ["maj3", "perf5", "maj7"], // major7
    d7: ["maj3", "perf5", "dom7"], // dom7
    m9: ["maj3", "perf5", "maj7", "maj9"], // major9
    d9: ["maj3", "perf5", "dom7", "dom9"], // dom9
  };

  // Create the noteLabels object with key-value pairs
  const noteLabels = {};

  // Add individual notes
  fullPiano.forEach((note) => {
    noteLabels[note] = [note];
  });

  // Add chords
  fullPiano.forEach((root) => {
    const rootMidi = noteToMidi(root);
    Object.entries(chordTypes).forEach(([type, intervals]) => {
      const chord = intervals
        .map((iv) => rootMidi + semitones[iv])
        .map(midiToNote);
      if (chord.every((n) => fullPiano.includes(n))) {
        noteLabels[`${root}${type}`] = [root, ...chord];
      }
    });
  });

  // console.log(noteLabels);

  // // Example usage:
  // console.log("C4:", noteLabels["C4"]);
  // console.log("C4_maj7:", noteLabels["C4_maj7"]);
  // console.log("A0_triad:", noteLabels["A0_triad"]);
  return noteLabels;
})();

function createNote(
  row,
  column,
  start = 0.0,
  end = 1,
  velocity = 1,
  label = "c3"
) {
  // console.log("mmm");
  const note = document.createElement("div");
  note.className = "note-block";
  note.dataset.row = row;
  note.dataset.column = column;
  note.dataset.start = start;
  note.dataset.end = end;
  note.dataset.velocity = velocity;

  const cellWidth = container.clientWidth / columns;
  const barWidth = cellWidth;
  const barHeight = 40;

  const span = end - start;
  const width = span * barWidth;
  const height = Math.max(velocity * barHeight, 4);

  const left = column * barWidth + start * barWidth;
  const top = row * barHeight + (barHeight - height);

  Object.assign(note.style, {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    background: "#6cf",
    border: "1px solid #039",
    boxSizing: "border-box",
  });

  // Start handle
  const startHandle = document.createElement("div");
  Object.assign(startHandle.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "2px",
    height: "100%",
    cursor: "ew-resize",
    background: "rgba(0,0,0,0.2)",
  });
  note.appendChild(startHandle);

  // End handle (resizer)
  // End handle (resizer)
  const endHandle = document.createElement("div");
  Object.assign(endHandle.style, {
    position: "absolute",
    top: "0",
    right: "0",
    width: "2px",
    height: "100%",
    background: "rgba(255,0,0,0.2)",
    cursor: "ew-resize",
    zIndex: 2,
  });
  note.appendChild(endHandle);

  const labelSpan = document.createElement("span");
  labelSpan.className = "note-label my-enum-options";
  labelSpan.textContent = label;
  labelSpan.dataset.options = '["C",]';
  labelSpan.dataset.value = label;

  Object.assign(labelSpan.style, {
    position: "absolute",
    width: "100%",
    height: "50%",
    display: "flex",
    background: "#fff9",
    // justifyContent: "center",
    // alignItems: "center",
    pointerEvents: "auto", // So it receives click
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "11px",
    userSelect: "none",
    overflow: "visible",
  });

  labelSpan.onclick = (e) => {
    e.stopPropagation(); // prevent deselecting the note
    if (e.shiftKey) {
      openEnumSelector(labelSpan); // Open dropdown only if Shift is held
    }
  };

  function openEnumSelector(target) {
    const currentValue = target.textContent;

    // Remove existing popups
    document.querySelectorAll(".enum-popup").forEach((e) => e.remove());

    // Create popup container
    const menu = document.createElement("div");
    menu.className = "enum-popup w3-card w3-white";
    Object.assign(menu.style, {
      position: "absolute",
      zIndex: 99999,
      width: "160px",
      maxHeight: "250px",
      overflowY: "auto",
      padding: "8px",
      fontSize: "14px",
      boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
    });

    // Position popup near target
    const rect = target.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + window.scrollY}px`;

    // Search input
    const input = document.createElement("input");
    input.className = "w3-input w3-border w3-small";
    input.placeholder = "Search note...";
    input.oninput = function () {
      const filter = input.value.toUpperCase();
      Array.from(list.children).forEach((li) => {
        const text = li.textContent.toUpperCase();
        li.style.display = text.includes(filter) ? "" : "none";
      });
    };
    menu.appendChild(input);

    // List container
    const list = document.createElement("ul");
    list.className = "w3-ul w3-hoverable";
    list.style.marginTop = "8px";
    list.style.cursor = "pointer";

    // List items
    Object.keys(noteLabels).forEach((label) => {
      const li = document.createElement("li");
      li.textContent = label;
      li.onclick = () => {
        target.textContent = label;
        target.dataset.value = label;
        menu.remove();
      };
      list.appendChild(li);
    });

    menu.appendChild(list);
    document.body.appendChild(menu);
    input.focus();

    // Close on click outside
    const close = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("mousedown", close);
      }
    };
    setTimeout(() => document.addEventListener("mousedown", close), 0);
  }

  note.appendChild(labelSpan);

  // Red overflow pointer
  const overflow = document.createElement("div");
  overflow.className = "overflow-pointer";
  Object.assign(overflow.style, {
    position: "absolute",
    width: "2px",
    height: "100%",
    right: "-4px",
    top: "0",
    background: "red",
    display: end > 1.0 ? "block" : "none",
    zIndex: "9999", // 🔺 Force on top
    pointerEvents: "none", // 🛡️ Doesn't block mouse events
  });
  note.appendChild(overflow);

  function renderOverflowArrow(note) {
    const row = parseInt(note.dataset.row);
    const column = parseInt(note.dataset.column);
    const start = parseFloat(note.dataset.start);
    const end = parseFloat(note.dataset.end);

    const barWidth = container.clientWidth / columns;
    const barHeight = 40;

    const overflowContainer = document.getElementById("overflowOverlay");

    // Remove previous overflow if any for this note
    const existing = overflowContainer.querySelector(
      `.overflow-arrow[data-key="${row}-${column}"]`
    );
    if (existing) existing.remove();

    if (end <= 1.0) return;

    const extraSpan = end - 1.0;
    const x1 = (column + 1) * barWidth;
    const x2 = x1 + extraSpan * barWidth;
    const y = row * barHeight + 2 + column * 2; // height offset per row for stacking

    const arrow = document.createElement("div");
    arrow.className = "overflow-arrow";
    arrow.dataset.key = `${row}-${column}`;
    Object.assign(arrow.style, {
      position: "absolute",
      left: `${x1}px`,
      top: `${y}px`,
      width: `${x2 - x1}px`,
      height: "2px",
      background: "red",
      zIndex: 9999,
    });

    overflowContainer.appendChild(arrow);
  }

  // Shift + mouse move to adjust velocity
  note.addEventListener("mousedown", (e) => {
    const parentCell = note.parentElement;
    focusedCell = note;

    // Reset all cells
    document.querySelectorAll(".note-cell").forEach((cell) => {
      cell.style.overflow = "hidden";
      cell.style.zIndex = "1";
    });

    // Focus the current cell
    parentCell.style.overflow = "visible";
    parentCell.style.zIndex = "10"; // Bring cell to front

    // Also raise this note in z-layer
    document
      .querySelectorAll(".note-block")
      .forEach((n) => (n.style.zIndex = "1"));
    note.style.zIndex = "10";

    if (!e.shiftKey) return;

    e.preventDefault();
    const startY = e.clientY;
    const originalV = parseFloat(note.dataset.velocity);

    const onMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let step = 0.05;

      if (e.ctrlKey && e.altKey) step = 0.001;
      else if (e.altKey && e.shiftKey) step = 1.0;
      else if (e.ctrlKey && e.shiftKey) step = 0.01;
      else if (e.ctrlKey) step = 0.1;
      else if (e.shiftKey) step = 0.05;
      else if (e.altKey) step = 0.2;

      let newV = originalV - deltaY * step * 0.1;
      newV = Math.max(0.05, Math.min(1.0, newV));

      note.dataset.velocity = newV;
      const newHeight = newV * barHeight;
      note.style.top = `${row * barHeight + (barHeight - newHeight)}px`;
      note.style.height = `${newHeight}px`;
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Start drag logic
  startHandle.onmousedown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const originalStart = parseFloat(note.dataset.start);
    const originalEnd = parseFloat(note.dataset.end);

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const delta = dx / barWidth;
      let newStart = Math.max(0.0, Math.min(1.0, originalStart + delta));
      newStart = Math.round(newStart * 100) / 100;
      const span = originalEnd - newStart;

      note.dataset.start = newStart;
      note.style.left = `${(column + newStart) * barWidth}px`;
      note.style.width = `${span * barWidth}px`;
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // End drag logic
  endHandle.onmousedown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const originalEnd = parseFloat(note.dataset.end);
    const originalStart = parseFloat(note.dataset.start);

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const delta = dx / barWidth;
      let newEnd = originalEnd + delta;
      newEnd = Math.max(originalStart + 0.05, newEnd);
      newEnd = Math.round(newEnd * 100) / 100;

      const totalSpan = newEnd - originalStart;
      note.dataset.end = newEnd;
      note.style.width = `${totalSpan * barWidth}px`;

      overflow.style.display = newEnd > 1.0 ? "block" : "none";
      renderOverflowArrow(note);
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  container.appendChild(note);

  note.addEventListener("click", (e) => {
    if (e.ctrlKey) {
      note.remove();
    }
  });

  renderOverflowArrow(note);
}

setupGrid(rows, columns);
// createNote(0, 0, 0.2, 1.3, 0.8);
// createNote(1, 2, 0.1, 0.9, 0.5);

document.addEventListener("mousedown", (e) => {
  if (!focusedCell) return;
  // console.log(focusedCell, e.target);
  // Check if the click is inside the focused cell
  if (focusedCell != e.target) {
    // console.log("kk");
    // Remove focus styles
    focusedCell.style.overflow = "hidden";
    focusedCell.style.zIndex = "1";
    focusedCell = null;
  }
});

let selectedFile = null;

function serializeNotes() {
  const notes = [];
  container.querySelectorAll(".note-block").forEach((note) => {
    notes.push({
      row: parseInt(note.dataset.row),
      column: parseInt(note.dataset.column),
      start: parseFloat(note.dataset.start),
      end: parseFloat(note.dataset.end),
      velocity: parseFloat(note.dataset.velocity),
      label: note.querySelector(".note-label")?.dataset.value || null,
    });
  });
  return notes;
}

async function saveNotesToFile() {
  if (selectedFile == null) return;
  const filepath = "tracks/" + selectedFile[1];
  const fileName = filepath.split("/").pop();
  // console.log(fileName);
  const notes = serializeNotes();
  const url = "/api/file?name=" + encodeURIComponent(filepath);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: JSON.stringify(notes) }),
  });

  const result = await res.json();
  alert(result.success, result.error);
}

document.querySelector("#saveTrack").onclick = () => {
  saveNotesToFile();
};

async function loadNoteFile(filePath) {
  const res = await fetch(
    `/api/file?name=${"tracks/" + encodeURIComponent(filePath)}`
  );
  try {
    const notes = await res.json();
    renderNotes(notes);
  } catch (e) {
    document.querySelectorAll(".note-block").forEach((el) => el.remove());
  }
}

function renderNotes(notes) {
  // container.innerHTML = "";
  // console.log(document.querySelectorAll(".note-block"));
  document.querySelectorAll(".note-block").forEach((el) => el.remove());
  for (const note of notes) {
    createNote(
      note.row,
      note.column,
      note.start,
      note.end,
      note.velocity,
      note.label || ""
    );
  }
}

// effects
// Available Tone.js effects
// const toneEffects = {
//   Reverb: Tone.Reverb,
//   Chorus: Tone.Chorus,
//   Distortion: Tone.Distortion,
//   PingPongDelay: Tone.PingPongDelay,
//   PolySynth: Tone.PolySynth,
// };

// const effectsContainer = document.getElementById("effectsContainer");
// const effectSelect = document.getElementById("effectSelect");
// const playBtn = document.getElementById("playTrackBtn");
// const stopBtn = document.getElementById("stopTrackBtn");

// const effectsInstances = [];
// let currentSynth = null;

// // When an effect is selected, add it
// effectSelect.onchange = () => {
//   const name = effectSelect.value;
//   addEffect(name);
//   effectSelect.selectedIndex = 0; // reset dropdown
// };

// // Add effect function
// function addEffect(name) {
//   const EffectClass = toneEffects[name];
//   if (!EffectClass) return;

//   // Defer creation until play — store only class name & config
//   const effectInfo = { name, EffectClass, instance: null };
//   effectsInstances.push(effectInfo);

//   const wrapper = document.createElement("div");
//   wrapper.className = "w3-card w3-border w3-margin-small";
//   wrapper.style.padding = "8px";

//   wrapper.innerHTML = `
//     <b>${name}</b> • wet: <input type="range" min="0" max="1" step="0.01" value="0.5" />
//     <button class="w3-button w3-small w3-red">Remove</button>
//   `;

//   const input = wrapper.querySelector("input");
//   input.oninput = () => {
//     if (effectInfo.instance?.wet) {
//       effectInfo.instance.wet.value = parseFloat(input.value);
//     }
//     effectInfo._wetValue = parseFloat(input.value); // store for later
//   };

//   wrapper.querySelector("button").onclick = () => {
//     if (effectInfo.instance) effectInfo.instance.disconnect();
//     effectsContainer.removeChild(wrapper);
//     const idx = effectsInstances.indexOf(effectInfo);
//     if (idx !== -1) effectsInstances.splice(idx, 1);
//   };

//   effectsContainer.appendChild(wrapper);
// }

// async function playNoteTrack() {
//   await Tone.start();

//   // Reset connections
//   effectsInstances.forEach((ei) => ei.instance?.disconnect());

//   // First effect must be a synth
//   const first = effectsInstances[0];
//   if (!first || !first.EffectClass) return;
//   currentSynth = new first.EffectClass(Tone.Synth); // Assume synth class passed
//   first.instance = currentSynth;

//   const gain = new Tone.Gain(0.8);
//   currentSynth.connect(gain);
//   let node = gain;

//   // Chain remaining effects
//   for (let i = 1; i < effectsInstances.length; i++) {
//     const ei = effectsInstances[i];
//     ei.instance = new ei.EffectClass();
//     if (ei._wetValue != null && ei.instance.wet) {
//       ei.instance.wet.value = ei._wetValue;
//     }
//     node.connect(ei.instance);
//     node = ei.instance;
//   }

//   node.toDestination();

//   // Play serialized notes
//   const notes = serializeNotes();
//   const now = Tone.now();

//   for (const n of notes) {
//     const time = now + n.column * 0.5 + n.start * 0.5;
//     const dur = (n.end - n.start) * 0.5;
//     const velocity = n.velocity;

//     currentSynth.triggerAttackRelease(n.label || "C4", dur, time, velocity);
//   }
// }

// const stopNoteTrack = () => {
//   if (currentSynth && currentSynth.releaseAll) {
//     currentSynth.releaseAll();
//   }
// };

const toneEffects = {
  Reverb: Tone.Reverb,
  Chorus: Tone.Chorus,
  Distortion: Tone.Distortion,
  PingPongDelay: Tone.PingPongDelay,
  PolySynth: Tone.PolySynth,
  Player: Tone.Player,
};

const effectsContainer = document.getElementById("effectsContainer");
const effectSelect = document.getElementById("effectSelect");
const effectsInstances = []; // { name, EffectClass, instance, wet, pan, volume }

// // When an effect is selected, add it
effectSelect.onchange = () => {
  const name = effectSelect.value;
  addEffect(name);
  effectSelect.selectedIndex = 0; // reset dropdown
};

function addEffect(name) {
  const EffectClass = toneEffects[name];
  if (!EffectClass) return;

  const info = {
    name,
    EffectClass,
    instance: null,
    wet: 0.5,
    pan: 0,
    volume: 0.8,
  };
  effectsInstances.push(info);

  // UI Wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "w3-card w3-border w3-margin-small";
  wrapper.style.padding = "8px";
  wrapper.innerHTML = `

    <b>${name}</b>
    <br/>
  <div class="w3-bar-block">
    <label>Wet:<span class="my-num-options" data-value="${info.wet}">${info.wet}</span></label>
    <label>Pan:<span class="my-num-options" data-value="${info.pan}">${info.pan}</span></label>
    <label>Volume:<span class="my-num-options" data-value="${info.volume}">${info.volume}</span></label>
    <br/>
    <button class="w3-button w3-small w3-blue">⚙️</button>
    <button class="w3-button w3-small w3-red">Remove</button>
    <button class="w3-button w3-small w3- update">update</button>
  `;

  const update = wrapper.querySelector(".update");
  update.onclick = () => {
    const p = wrapper.querySelectorAll("span");
    info.wet = parseFloat(p[0].textContent);
    info.pan = parseFloat(p[1].textContent);
    info.volume = parseFloat(p[2].textContent);
  };
  // wetInput.oninput = () => (info.wet = parseFloat(wetInput.value));
  // panInput.oninput = () => (info.pan = parseFloat(panInput.value));
  // volInput.oninput = () => (info.volume = parseFloat(volInput.value));

  // Remove
  wrapper.querySelector(".w3-red").onclick = () => {
    wrapper.remove();
    effectsInstances.splice(effectsInstances.indexOf(info), 1);
  };

  // Open detailed modal
  wrapper.querySelector(".w3-blue").onclick = () => openEffectModal(info);

  effectsContainer.appendChild(wrapper);
  mynumoptions();
}

function openEffectModal(info) {
  const modal = document.createElement("div");
  modal.className = "w3-modal";
  modal.style.zIndex = 100;
  modal.innerHTML = `
    <div class="w3-modal-content w3-card" style="max-width:400px;padding:16px;">
      <header class="w3-container"><h4>${info.name} Settings</h4></header>
      <div id="modalBody" class="w3-container"></div>
      <footer class="w3-container">
        <button class="w3-button w3-blue">OK</button>
        <button class="w3-button w3-red">Cancel</button>
      </footer>
    </div>
  `;
  document.body.append(modal);

  const body = modal.querySelector("#modalBody");
  // Generate controls based on effect type
  if (info.name === "Reverb") {
    body.innerHTML = `<label>Decay:<span id="decay" class="my-num-options" data-value="${
      info.decay || 1
    }">${info.decay || 1}</span></label>`;
    modal.querySelector(".w3-blue").onclick = () => {
      info.decay = parseFloat(body.querySelector("#decay").textContent);
      modal.remove();
    };
  } else if (info.name == "Player") {
    body.innerHTML = `<label>Choose Audio:
      <select id="playerFileSelect" class="w3-select w3-margin-top w3-border"></select>
    </label>`;
    fetch("/list-audio") // Example API: returns array of filenames
      .then((res) => res.json())
      .then((files) => {
        const select = document.getElementById("playerFileSelect");
        // console.log(files);
        select.innerHTML = "";
        files.forEach((file) => {
          const opt = document.createElement("option");
          opt.value = file;
          opt.textContent = file;
          select.appendChild(opt);
        });
      });
    modal.querySelector(".w3-blue").onclick = () => {
      const select = document.getElementById("playerFileSelect");
      console.log(select.value);
      effectsInstances[0].path = "audio/" + select.value;
      modal.remove();
    };
  } else {
    modal.querySelector(".w3-blue").onclick = () => modal.remove();
  }
  modal.querySelector(".w3-red").onclick = () => modal.remove();

  modal.style.display = "block";

  mynumoptions();
}

let currentSynth = null;

async function playNoteTrack() {
  await Tone.start();

  effectsInstances.forEach((e) => e.instance?.dispose());

  if (currentSynth && currentSynth.releaseAll) {
    currentSynth.releaseAll();
  }

  // First must be synth or poly synth
  const first = effectsInstances[0];
  // currentSynth = first.EffectClass;
  if (!first) return;

  const SynthClass = toneEffects[first.name];
  const synth = new SynthClass(); //(first.instance =
  // first.name === "PolySynth" ? new SynthClass(Tone.Synth) : new SynthClass());
  currentSynth = synth;
  if (first.name == "Player") {
    await currentSynth.load(first.path);
  }

  const volNode = new Tone.Gain(first.volume).toDestination();
  synth.connect(volNode);

  if (synth.pan) synth.pan.value = first.pan;
  if (synth.wet) synth.wet.value = first.wet;

  let node = volNode;
  for (let i = 1; i < effectsInstances.length; i++) {
    const ei = effectsInstances[i];
    ei.instance = new ei.EffectClass();
    if (ei.wet && ei.instance.wet) ei.instance.wet.value = ei.wet;
    if (ei.pan && ei.instance.pan) ei.instance.pan.value = ei.pan;
    node.connect(ei.instance);
    node = ei.instance;
  }

  node.toDestination();

  const notes = serializeNotes();
  const f = () => {
    const now = Tone.now();
    notes.forEach((n) => {
      const t = now + ((n.column + n.start) * getBeatDurationMs()) / 1000;
      const d = ((n.end - n.start) * getBeatDurationMs()) / 1000;
      const formattedLabel =
        n.label.charAt(0).toUpperCase() + n.label.slice(1).toLowerCase();
      noteLabels[formattedLabel || "C3"].forEach((pitch) => {
        const playbackRate = getPlaybackRate("C4", pitch);
        if (first.name == "Player") {
          setTimeout(() => {
            synth.playbackRate = playbackRate;
            synth.start();
          }, (t - Tone.now()) * 1000);
          // synth.start();
        }
      });

      if (synth.triggerAttackRelease) {
        // console.log(noteLabels[n.label], n.label);
        const formattedLabel =
          n.label.charAt(0).toUpperCase() + n.label.slice(1).toLowerCase();

        synth.triggerAttackRelease(
          noteLabels[formattedLabel || "C3"],
          d,
          t,
          n.velocity
        );
      }
    });
  };
  f();
  playing = setInterval(() => {
    f();
    // console.log("kk");
  }, getBeatDurationMs() * parseFloat(document.querySelector("#bars").textContent || "16"));
}

let playing = null;

function getBeatDurationMs() {
  const bpm = parseFloat(document.getElementById("bpm").textContent || "120");
  // console.log((60 / bpm) * 1000);
  return (60 / bpm) * 1000; // duration of 1 beat in milliseconds
}

function getPlaybackRate(fromNote, toNote) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const midi = (note) => {
    const name = note.match(/[A-G]#?/i)[0].toUpperCase();
    const octave = parseInt(note.slice(name.length));
    return octave * 12 + noteNames.indexOf(name);
  };

  const fromMidi = midi(fromNote);
  const toMidi = midi(toNote);
  const semitoneDiff = toMidi - fromMidi;

  return Math.pow(2, semitoneDiff / 12);
}

const stopNoteTrack = () => {
  // if (currentSynth) {
  //   // For PolySynth:
  //   if (currentSynth.releaseAll) {
  //     currentSynth.releaseAll();
  //   }
  //   // For mono synths:
  //   else if (currentSynth.triggerRelease) {
  //     currentSynth.triggerRelease();
  //   }
  // }
  if (playing != null) {
    clearInterval(playing);
    playing = null;
  }
};
