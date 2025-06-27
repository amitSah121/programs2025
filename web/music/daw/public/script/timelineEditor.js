const increase_sidebar_width_timeline = () => {
  let sidebar = document.querySelector("#timelineView #l-sidebar");
  let editor = document.querySelector("#timelineView #editor");

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

const decrease_sidebar_width_timeline = () => {
  let sidebar = document.querySelector("#timelineView #l-sidebar");
  let editor = document.querySelector("#timelineView #editor");

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

async function loadTrackFilesTl() {
  const explorer = document.querySelector("#timelineView #sidebar-elements");
  explorer.innerHTML = ""; // Clear previous

  //   console.log(await (await fetch("/api/allFiles")).json());
  const res = await fetch("/api/allFiles?folder=");
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
          showLeftContextMenuTimeLine(e.pageX, e.pageY, item);
        });

        details.appendChild(summary);
        details.appendChild(createList(item.children || []));
        li.appendChild(details);
      } else {
        li.textContent = `🎵 ${item.name}`;

        // ✅ Attach contextmenu to file li
        li.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          showLeftContextMenuTimeLine(e.pageX, e.pageY, item);
        });

        li.onclick = () => openNoteFileTimeline(item.path, li);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  const listTree = createList(data);

  //   console.log(listTree);
  explorer.appendChild(listTree);
}

async function openNoteFileTimeline(path, li) {
  const p = document.querySelectorAll("#timelineView #sidebar-elements li");
  p.forEach((x) => x.classList.remove("w3-light-grey"));
  li.classList.add("w3-light-grey");
  selectedFileTl = [li, path];
  //   await loadNoteFile(path);
  // console.log("Opening:", path);
}

let selectedFileTl = null;
loadTrackFilesTl();

document.querySelector("#timelineView #l-sidebar").oncontextmenu = (e) => {
  if (e.target === e.currentTarget) {
    e.preventDefault();
    showLeftContextMenuTimeLine(e.pageX, e.pageY, null); // null → root
  }
};

let leftContextTargetTimeline = null;

function showLeftContextMenuTimeLine(x, y, item) {
  const menu = document.getElementById("leftContextMenuTl");
  leftContextTargetTimeline = item;

  // Show/hide options
  document.querySelector("#leftContextMenuTl #newFile").style.display =
    item?.type === "file" ? "none" : "block";
  document.querySelector("#leftContextMenuTl #newFolder").style.display =
    item?.type === "file" ? "none" : "block";
  document.querySelector("#leftContextMenuTl #deleteItem").style.display = item
    ? "block"
    : "none";
  document.querySelector("#leftContextMenuTl #renameItem").style.display = item
    ? "block"
    : "none";

  document.querySelector("#leftContextMenuTl #copyItem").style.display =
    item?.type === "file" ? "block" : "none";

  // Show menu
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

// Hide on click outside
document.addEventListener("click", () => {
  document.getElementById("leftContextMenuTl").style.display = "none";
});

document.querySelector("#timelineView #newFile").onclick = () => {
  openNameModalTl("newFile", leftContextTargetTimeline);
};

document.querySelector("#timelineView #newFolder").onclick = () => {
  openNameModalTl("newFolder", leftContextTargetTimeline);
};

document.querySelector("#timelineView #deleteItem").onclick = async () => {
  if (!leftContextTargetTimeline) return;

  const isFolder = leftContextTargetTimeline.type === "folder";
  const confirmText = `Are you sure you want to delete this ${
    isFolder ? "folder" : "file"
  }: "${leftContextTargetTimeline.name}"?`;

  if (!confirm(confirmText)) return;

  //   console.log(leftContextTargetTimeline);

  const endpoint = isFolder
    ? `/api/fileMethods/deleteFolder?folderPath=${encodeURIComponent(
        leftContextTargetTimeline.path
      )}`
    : `/api/fileMethods/deleteFile?filePath=${encodeURIComponent(
        leftContextTargetTimeline.path
      )}`;

  fetch(endpoint, { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadTrackFilesTl(); // refresh view
        loadTrackFiles();
      } else {
        alert("Error: " + data.error);
      }
    });
};

document.querySelector("#timelineView #renameItem").onclick = () => {
  if (!leftContextTargetTimeline) return;
  openNameModalTl(
    leftContextTargetTimeline.type === "folder" ? "renameFolder" : "renameFile",
    leftContextTargetTimeline
  );
};

document.querySelector("#timelineView #copyItem").onclick = async () => {
  if (!leftContextTargetTimeline) return;
  // console.log(leftContextTargetTimeline);
  const endpoint = `/api/file?name=${encodeURIComponent(
    leftContextTargetTimeline.path
  )}`;

  navigator.clipboard.writeText(endpoint);
  // const res = await fetch(endpoint);
  // try {
  //   navigator.clipboard.writeText(await res.text());
  // } catch (e) {}
};

let nameModalActionTl = null;
let nameModalTargetTl = null;

function openNameModalTl(action, target = null) {
  nameModalActionTl = action; // "newFile", "newFolder", "renameFile", "renameFolder"
  nameModalTargetTl = target;

  document.querySelector("#timelineView #nameModalTitle").textContent = {
    newFile: "Create New File",
    newFolder: "Create New Folder",
    renameFile: "Rename File",
    renameFolder: "Rename Folder",
  }[action];

  document.querySelector("#timelineView #nameModalLabel").textContent = {
    newFile: "File name:",
    newFolder: "Folder name:",
    renameFile: "New file name:",
    renameFolder: "New folder name:",
  }[action];

  document.querySelector("#timelineView #nameModalInput").value =
    action.startsWith("rename") ? target.name : "";

  document.querySelector("#timelineView #nameModal").style.display = "block";
}

function closeNameModalTl() {
  document.querySelector("#timelineView #nameModal").style.display = "none";
  nameModalActionTl = null;
  nameModalTargetTl = null;
}

function confirmNameModalTl() {
  const inputName = document
    .querySelector("#timelineView #nameModalInput")
    .value.trim();
  if (!inputName) return alert("Please enter a valid name.");

  let url = "";
  let method = "POST";

  const path = nameModalTargetTl?.path || "";

  //   console.log(path, inputName);

  switch (nameModalActionTl) {
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
        loadTrackFilesTl();
        loadTrackFiles();
        closeNameModalTl();
      } else {
        alert("Error: " + data.error);
      }
    });
}

////////////////
function getDateTimeId() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "_" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

class Component {
  constructor(id) {
    this.id = id || this.generateId();
    this.name = "Noname";

    // Main synth/instrument object (e.g., Tone.Synth, MySynth, Player)
    this.synth = null;

    // UI DOM elements
    this.r_ele = null; // right bar UI
    this.m_ele = null; // middle section, if any
    this.b_ele = []; // bottom bar container

    // State flags
    this.solo = false;
    this.mute = false;
    this.volume = 1.0;

    // this.trackClips = []; // ← Key part added

    // Automations (used by p5.js)
    // this.automations = []; // list of { param: "filter.freq", curve: svgPathData, ... }

    // Child rows (bottom bar items)
    // this.subComponents = []; // list of SubComponent instances
  }

  generateId() {
    return "comp_" + new Date().toISOString().replace(/[-:.TZ]/g, "");
  }
}

class Group {
  constructor() {
    this.input = new Tone.Gain();
    this.output = new Tone.Gain();
    this.components = [];

    this.song_length = 60000; // in ms
    this.control_head = 0;
  }

  addComponent(comp) {
    if (!comp || !comp.synth || !comp.synth.input || !comp.synth.output) return;

    // Connect group input to this component’s input
    this.input.connect(comp.synth.input);

    // Connect this component’s output to group output
    comp.synth.output.connect(this.output);

    this.components.push(comp);
  }

  removeComponent(comp) {
    const index = this.components.indexOf(comp);
    if (index === -1) return;

    // Disconnect from group input
    this.input.disconnect(comp.synth.input);

    // Disconnect from group output
    comp.synth.output.disconnect(this.output);

    this.components.splice(index, 1);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  findComponentById(id) {
    return this.components.find((c) => c.id === id);
  }
}

/*

const comp = new Component();
comp.synth = new MySynth(); // your custom synth
comp.volume = 0.8;
comp.solo = false;

const sub1 = new SubComponent(comp, "Oscillator A");
sub1.setParam("wave", "sawtooth");
sub1.setParam("detune", -10);

comp.addSubComponent(sub1);

const automation = {
  param: "filter.frequency",
  curve: "M0,1 C0.3,0.8 0.7,0.2 1,0" // SVG-style
};
comp.addAutomation(automation);

*/
const project = new Group();

let currentComp = null;

const add_component = () => {
  let text = document.querySelector(
    "#timelineView #r-sidebar .my-enum-options"
  ).textContent;
  //   console.log(text);
  if (text == "MySynth") {
    createMySynthComponent("MySynth", project);
  }
};

// add_component();
// add_component();

const getRandomNote = () => {
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const octave = Math.floor(Math.random() * 3) + 3; // 3 to 5
  const note = notes[Math.floor(Math.random() * notes.length)];
  return note + octave;
};

// Trigger all components
const triggerAllComponents = (components, time = Tone.now()) => {
  let solos = [];
  let mutes = [];
  for (const comp of components) {
    let solo = comp.r_ele.querySelectorAll("input")[0];
    if (solo.checked) {
      solos.push(comp);
    }
  }

  for (const comp of components) {
    let mute = comp.r_ele.querySelectorAll("input")[1];
    if (mute.checked) {
      mutes.push(comp);
    }
  }

  let setA = new Set(solos);
  let setB = new Set(mutes);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));

  if (solos.length > 0) {
    for (const comp of solos) {
      if (!intersection.has(comp)) {
        if (comp?.synth?.triggerAttackRelease) {
          const clipsJson = comp.m_ele.clips;
          if (!clipsJson) return;

          const clips = JSON.parse(clipsJson);

          clips.forEach((clip) => {
            const clipStart = clip.start ?? 0;

            clip.read.forEach((note) => {
              const noteStartTime = time + (note.start ?? 0); // relative to `time`
              const noteDuration = (note.end ?? note.start + 1) - note.start;
              const velocity = note.velocity ?? 1;
              const label = note.label ?? "C3";

              comp.synth.triggerAttackRelease(
                label,
                noteDuration,
                noteStartTime,
                velocity
              );
            });
          });
        }
      }
    }
  } else {
    for (const comp of components) {
      if (!setB.has(comp)) {
        if (comp?.synth?.triggerAttackRelease) {
          const clipsJson = comp.m_ele.clips;
          if (!clipsJson) return;

          const clips = clipsJson;

          clips.forEach((clip) => {
            const clipStart = clip.start ?? 0;

            let t = 0;
            clip.read.forEach((note) => {
              const bpms = parseFloat(
                document.querySelector("#timelineView #bpms").textContent ||
                  "120"
              );
              const noteStartTime =
                time +
                ((note.column + note.start) * ((60 / bpms) * 1000)) / 1000;
              const noteDuration =
                ((note.end - note.start) * ((60 / bpms) * 1000)) / 1000;
              // const noteStartTime =
              //   time - (note.start * bpms) / 16 + (note.column * bpms) / 16; // relative to `time`
              // const noteDuration = noteStartTime + (note.end * bpms) / 16;
              const velocity = note.velocity ?? 1;
              const formattedLabel =
                note.label.charAt(0).toUpperCase() +
                note.label.slice(1).toLowerCase();

              const label = noteLabels[formattedLabel ?? "C3"];

              // console.log(noteStartTime, noteDuration, label, velocity);

              label.forEach((f) => {
                setTimeout(() => {
                  // console.log("jkd", t, f);
                  comp.synth.triggerAttackRelease(
                    f,
                    noteStartTime + noteDuration,
                    noteStartTime,
                    velocity
                  );
                }, t * 1000);
                // t += noteStartTime + noteDuration;
              });
              t += noteStartTime + noteDuration;
            });
          });
        }
      }
    }
  }
};

const playTimeline = async () => {
  if (!isToneStarted) {
    await Tone.start();
    isToneStarted = true;
  }

  if (project?.output?.toDestination) {
    project.output.toDestination();
  }

  const now = Tone.now();
  triggerAllComponents(project.components || [], now);
};

// Ensure Tone.js is started only once
let isToneStarted = false;
let isPlaying = false;

document.addEventListener("keydown", async (e) => {
  if ((e.key === "p" || e.key === "P") && !isPlaying) {
    isPlaying = true;

    if (!isToneStarted) {
      await Tone.start();
      isToneStarted = true;
    }

    currentComp.synth.output.toDestination();
    currentComp.synth.triggerAttack("c3", Tone.now(), 1);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "p" || e.key === "P") {
    isPlaying = false;
    currentComp.synth.triggerRelease(Tone.now());
  }
});

const sketch = (p) => {
  this.c = 1;
  this.x = 0;
  this.y = 0;

  this.topbar = new Rect();
  this.open_menu = false;
  this.menu_props = { pos: { x: 0, y: 0 } };
  p.setup = () => {
    canvasParent = document.getElementById("canvas");
    canvasParent.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    const w = canvasParent.clientWidth;
    const h = canvasParent.clientHeight - 10;

    const cnv = p.createCanvas(w, h);
    cnv.parent(canvasParent); // <-- attaches canvas to the div

    this.topbar.w = p.width;
    this.topbar.h = 45;
  };

  p.draw = () => {
    // const song_width =
    p.background(255);
    p.push();
    p.translate(-this.x, -this.y + 45);
    p.scale(this.c);
    // p.rect(0, 0, 100, 100);
    let comps = project.components;
    // console.log(comps.length);
    p.push();
    const height = 40;
    const song_width = 50;
    for (let i = 0; i < comps.length; i++) {
      // p.noStroke();
      p.stroke(colors[0]);
      p.fill(colors[4]);
      p.rect(0, i * height, project.song_length / song_width, height);
      // console.log(comps[i].name);
      for (let j = 0; j < comps[i].m_ele.clips.length; j++) {
        const r = comps[i].m_ele.clips[j];
        p.fill(colors[2]);
        // console.log(r.start, r.len, r.read);
        p.rect(r.start, i * height, r.length, height);
        p.fill(colors[0]);
        p.text(r.name, r.start, i * height + 35);
        // console.log(p.mouseX / this.c, p.mouseY / this.c, r.start, i * height);
        if (
          p.mouseIsPressed &&
          p.mouseX / this.c > r.start &&
          p.mouseX / this.c < r.start + r.length &&
          (p.mouseY - 45) / this.c > i * height &&
          (p.mouseY - 45) / this.c < i * height + height
        ) {
          const delx = p.mouseX - p.pmouseX;
          // const dely = p.mouseY - p.pmouseY;
          r.start += delx / this.c;
          if (r.start < 0) r.start = 0;
        }
      }
      p.fill(colors[0]);
      p.text(
        comps[i].name,
        0 + this.x,
        i * height + 10,
        project.song_length * 4,
        height
      );
    }
    p.pop();
    //

    p.pop();
    this.topbar.draw(p);
    p.push();

    p.stroke(...colors[0]);
    p.line(
      project.control_head - this.x,
      -45,
      project.control_head - this.x,
      p.height + 45
    );
    for (let i = 0; i < (project.song_length * this.c) / song_width; i += 8) {
      p.rect(i - this.x, 2, 2, this.topbar.h / 2);
      if (i % 30 == 0) {
        p.text(
          parseInt((i / ((project.song_length * this.c) / song_width)) * 60),
          i - this.x,
          45
        );
        // console.log(i - this.x * this.c);
      }
      // if (i % 32 == 0) {
      //   p.push();
      //   p.noStroke();
      //   p.fill(20, 100);
      //   p.rect(i - this.x, 2, 2, p.height);
      //   p.pop();
      // }
    }
    p.pop();
    p.push();
    if (this.open_menu) {
      const pos = this.menu_props.pos;
      p.rect(pos.x, pos.y, 40, 60);
      p.translate(2, 2);
      p.text("copy", pos.x, pos.y + 10);
      p.text("cut", pos.x, pos.y + 20);
      p.text("paste", pos.x, pos.y + 30);
      p.text("delete", pos.x, pos.y + 40);
      p.text("split", pos.x, pos.y + 50);
    }
    p.pop();

    if (p.mouseIsPressed && p.keyIsPressed && p.keyCode == p.CONTROL) {
      this.x -= p.mouseX - p.pmouseX;
      this.y -= p.mouseY - p.pmouseY;

      if (this.x < 0) this.x = 0;
      if (this.y < 0) this.y = 0;

      if (this.x > (project.song_length * this.c) / song_width - p.width)
        this.x = (project.song_length * this.c) / song_width - p.width;
    }

    if (p.mouseIsPressed && this.topbar.collision(p.mouseX, p.mouseY)) {
      project.control_head = p.mouseX + this.x;
    }
  };

  p.mousePressed = (e) => {
    if (e.button == 2) {
      this.open_menu = !this.open_menu;
      this.menu_props.pos.x = p.mouseX;
      this.menu_props.pos.y = p.mouseY;
    }

    if (e.button == 0 && this.open_menu) {
      let pos = this.menu_props.pos;
      if (p.mouseX > pos.x && p.mouseX < pos.x + 60) {
        if (p.mouseY > pos.y && p.mouseY < pos.y + 10) {
          console.log("copy");
        } else if (p.mouseY > pos.y + 10 && p.mouseY < pos.y + 20) {
          console.log("cut");
        } else if (p.mouseY > pos.y + 20 && p.mouseY < pos.y + 30) {
          // console.log("paste");
          this.pasteClipboard();
        } else if (p.mouseY > pos.y + 30 && p.mouseY < pos.y + 40) {
          console.log("delete");
        } else if (p.mouseY > pos.y + 40 && p.mouseY < pos.y + 50) {
          console.log("split");
        }
      }

      this.open_menu = false;
    }
  };

  p.keyReleased = () => {
    if (p.key == "c") {
      console.log("copy");
    } else if (p.key == "x") {
      console.log("cut");
    } else if (p.key == "v") {
      // console.log("paste");
      this.pasteClipboard();
    } else if (p.key == "d") {
      console.log("delete");
    } else if (p.key == "s") {
      console.log("split");
    }
  };

  p.mouseWheel = (e) => {
    const height = 40;
    const song_width = 50;
    const precision = 0.05;
    const original = (project.song_length * this.c) / song_width;
    const ratio = project.control_head / original;
    if (e.delta > 0) {
      this.c += precision;
    } else {
      this.c -= precision;
    }

    if ((project.song_length * this.c) / song_width < p.width) {
      this.c += precision;
    }

    // console.log((project.song_length * this.c) / song_width, " ", p.width);

    if (this.c <= 0.2) {
      this.c = 0.2;
    } else if (this.c >= 10) {
      this.c = 10;
    }
    const now = (project.song_length * this.c) / song_width;
    project.control_head = now * ratio;

    // console.log(this.c);
  };

  this.pasteClipboard = async () => {
    const song_width = 50;
    const text = await navigator.clipboard.readText();
    if (text.startsWith("/api")) {
      const fr = await fetch(text);
      const read = await fr.json();
      const len =
        (((parseInt(document.querySelector("#timelineView #bars").textContent) *
          parseInt(document.querySelector("#timelineView #bpms").textContent)) /
          60) *
          1000) /
        song_width;
      // console.log(len);
      currentComp.m_ele.clips.push({
        length: len,
        start: project.control_head / this.c,
        end: project.control_head / this.c + len,
        read,
        name: text.split("%2F")[1],
      });
    }
  };
};

const colors = [
  [0, 0, 0],
  [1, 1, 1],
  [200, 0, 0],
  [200, 80, 120],
  [120, 200, 80],
];
class Rect {
  constructor() {
    this.x = this.y = 0;
    this.w = this.h = 100;
    this.color = 3;
  }

  draw(p) {
    p.push();
    p.noStroke();
    p.fill(...colors[this.color]);
    p.rect(this.x, this.y, this.w, this.h);
    p.pop();
  }

  collision(a, b) {
    return (
      a > this.x && a < this.x + this.w && b > this.y && b < this.y + this.h
    );
  }
}

// Attach sketch to p5 instance
new p5(sketch);
