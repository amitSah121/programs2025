let file_content_json;
let editorAPI;

window.onload = async () => {
  editorAPI = starting_editor();
  editorAPI.createBlock();
  loadSidebar();

  const res = await fetch("/api/file?name=file_content.json");
  const text = await res.text();
  file_content_json = JSON.parse(text);
};

const open_sidebar = () => {
  w3.removeClass("#sidebar-full", "w3-hide");
  w3.addClass("#sidebar-shrunk", "w3-hide");
  w3.addStyle("#sidebar", "width", "");
};

const close_sidebar = () => {
  w3.removeClass("#sidebar-shrunk", "w3-hide");
  w3.addClass("#sidebar-full", "w3-hide");
  w3.addStyle("#sidebar", "width", "2%");
};

const increase_sidebar_width = () => {
  let sidebar = document.querySelector("#sidebar");

  for (let i = 1; i <= 8; i++) {
    let currentClass = `l${i}`;
    if (sidebar.classList.contains(currentClass)) {
      if (i < 8) {
        sidebar.classList.remove(currentClass);
        sidebar.classList.add(`l${i + 1}`);
      }
      break;
    }
  }
};

const decrease_sidebar_width = () => {
  let sidebar = document.querySelector("#sidebar");

  for (let i = 1; i <= 8; i++) {
    let currentClass = `l${i}`;
    if (sidebar.classList.contains(currentClass)) {
      if (i > 1) {
        sidebar.classList.remove(currentClass);
        sidebar.classList.add(`l${i - 1}`);
      }
      break;
    }
  }
};

const starting_editor = () => {
  const container = document.getElementById("container");

  class MarkdownBlock {
    constructor(text) {
      this.text = String(text || "").trim();
      this.type = this.detectType();
      this.classes = "";
    }

    detectType() {
      const lines = this.text.split("\n");

      // Multiline block: starts with ++type and ends with --type
      if (
        lines[0].startsWith("++") &&
        lines[lines.length - 1].startsWith("--")
      ) {
        const startType = lines[0]
          .split(" ")[0]
          .substring(2)
          .trim()
          .toLowerCase();
        // console.log(startType);
        let l1 = lines[0].split(" ");
        l1.shift();
        this.classes = l1.join(" ").trim();
        const endType = lines[lines.length - 1]
          .substring(2)
          .trim()
          .toLowerCase();
        // console.log(startType,endType);
        if (startType === endType) return startType;
        return "notcomplete";
      }

      // Single-line heading
      if (/^#{1,6} /.test(this.text)) return "heading";
      
      if(lines[0].startsWith("+-")) return "single_liner";

      // Default fallback
      return "line";
    }

    isComplete() {
      const lines = this.text.split("\n");

      if (["p", "list", "table"].includes(this.type)) {
        return (
          lines[0].startsWith("++" + this.type) &&
          lines[lines.length - 1].startsWith("--" + this.type)
        );
      }

      return this.type !== "notcomplete";
    }

    toHTML() {
      const lines = this.text.split("\n");
      let l1 = lines[0].split(" ");
      l1.shift();
      this.classes = l1.join(" ").trim();
      switch (this.type) {
        case "heading": {
          const match = this.text.match(/^(#+)\s+(.*)/);
          const level = match[1].length;
          return `<h${level}>${applyInlineMarkdown(match[2])}</h${level}>`;
        }

        case "line":
          return `<p class="${this.classes}">${applyInlineMarkdown(
            this.text
          )}</p>`;

        case "p": {
          const paraLines = lines.slice(1, -1).join("\n");
          return `<p  class="${this.classes}">${applyInlineMarkdown(
            paraLines
          ).replace(/\n/g, "<br>")}</p>`;
        }

        case "list": {
          const content = lines.slice(1, -1);
          let html = `<ul class='ul w3-padding ${this.classes}'>`;
          for (let line of content) {
            if (line.startsWith("#")) {
              html += `<strong>${applyInlineMarkdown(
                line.slice(1).trim()
              )}</strong>`;
            } else if (!line.startsWith("--list")) {
              const nums = line.split(" ")[0].length;
              // console.log(nums);
              if (nums == 1) {
                html += `<li style="border-bottom: 1px solid #ddd;"><span>${applyInlineMarkdown(line.slice(1).trim())}</span></li>`;
              } else {
                html += `<li>`;
                for (let i = 0; i < nums - 1; i++) {
                  html += `<ul class='ul'><li>`;
                }
                html += `<li style="border-bottom: 1px solid #ddd;"><span>${applyInlineMarkdown(line.slice(3).trim())}</span></li>`;
                for (let i = 0; i < nums - 1; i++) {
                  html += `</li></ul>`;
                }
                html += `</li>`;
              }
            }
          }
          html += "</ul>";
          return html;
        }

        case "table": {
          const rows = lines
            .slice(1, -1)
            .map((line) => {
              const cells = line
                .split(";")
                .map((cell) => {
                  const trimmed = cell.trim();
                  if (trimmed.startsWith("#")) {
                    return `<th>${applyInlineMarkdown(
                      trimmed.slice(1).trim()
                    )}</th>`;
                  } else {
                    return `<td>${applyInlineMarkdown(trimmed)}</td>`;
                  }
                })
                .join("");
              return `<tr>${cells}</tr>`;
            })
            .join("");
          return `<table class="w3-table w3-table-all ${this.classes}">${rows}</table>`;
        }
        
        case "single_liner": {
          let ot = this.text.split(" ");
          ot.shift();
          let ot1 = ot.shift().split("_");
          let ot2 = ot1.shift();
          return `<${ot2} class='${ot1.join(" ")}'>${ot.join(" ")}</ot2>`;
        }
        

        default:
          // console.log(this.type, lines);
          const ot = [lines.shift().substring(2), lines.pop()]
          const content = lines.join("\n");
          if(ot[0].at(0) == "n"){
            let attr = this.classes.split(" ");
            attr.shift();
            return `<${ot[0].substring(2)} ${attr.join(" ")}>${applyInlineMarkdown(
              content
            ).replace(/\n/g, "<br>")}</${ot[0]}>`;
          }
          
          return `<${ot[0]}  class="${this.classes}">${applyInlineMarkdown(
            content
          ).replace(/\n/g, "<br>")}</${ot[0]}>`;
      }
    }
  }

  function applyInlineMarkdown(text) {
    // console.log(text);
    return (
      text
        // Bold using **** or __
        .replace(/\*\*\*\*(.*?)\*\*\*\*/g, "<strong>$1</strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.*?)__/g, "<strong>$1</strong>")

        // Inline headings (# Something) – optional
        .replace(/^#{1,6} (.*)$/gm, (match, content, offset, fullText) => {
          const level = match.match(/^#+/)[0].length;
          return `<h${level}>${content.trim()}</h${level}>`;
        })
    );
  }

  function createBlock(content = "", afterThis = null) {
    const wrapper = document.createElement("div");
    const textarea = document.createElement("textarea");
    const mdDiv = document.createElement("div");

    wrapper.classList.add("editor");
    textarea.value = content;
    mdDiv.className = "markdown";
    mdDiv.style.display = "none";
    // wrapper.className = "w3-container w3-padding w3-border-bottom";
    // mdDiv.className = "w3-container w3-light-grey w3-padding-small w3-border w3-round w3-margin-bottom";

    wrapper.appendChild(textarea);
    wrapper.appendChild(mdDiv);
    //container.appendChild(wrapper);
    container.insertBefore(wrapper, afterThis?.nextSibling || null);

    const autoGrow = () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    };

    textarea.addEventListener("keydown", (event) => {
      // console.log("kkdd");
      if (event.key !== "Enter") return;
      saveinhidden();
      // console.log("kkdd");
      const value = textarea.value;
      const lines = value.split("\n");
      const caretPosition = textarea.selectionStart;

      // Figure out which line caret is on
      const caretLineIndex =
        value.slice(0, caretPosition).split("\n").length - 1;
      const isLastLine = caretLineIndex === lines.length - 1;

      const ctrlEnter = event.ctrlKey && event.key === "Enter";
      const enterAtLastLine =
        !event.ctrlKey && event.key === "Enter" && isLastLine;
      if ((ctrlEnter || enterAtLastLine) && isCompleteBlock(value)) {
        // console.log("skkds");
        event.preventDefault();
        const newBlock = createBlock("", wrapper); // insert after current block
        setTimeout(() => {
          newBlock.querySelector("textarea")?.focus();
        }, 0);
      }
    });

    textarea.addEventListener("input", autoGrow);
    textarea.addEventListener("blur", () => {
      const value = textarea.value.trim();

      // ✅ Get all blocks (divs with class 'editor')
      const blocks = container.querySelectorAll(".editor");
      const isOnlyBlock = blocks.length === 1;

      // ✅ If empty and not the only block, remove it
      if (value === "" && !isOnlyBlock) {
        wrapper.remove();
        return;
      }

      // ✅ Otherwise convert to rendered Markdown
      const html = markdownToHTML(value);
      mdDiv.innerHTML = html;
      textarea.style.display = "none";
      mdDiv.style.display = "block";
    });

    mdDiv.addEventListener("click", () => {
      textarea.style.display = "block";
      mdDiv.style.display = "none";
      textarea.focus();
      autoGrow();
    });

    autoGrow();
    return wrapper;
  }

  function isCompleteBlock(text) {
    const lines = String(text || "")
      .split("\n")
      .map((l) => l.trim());
    if (lines.length === 0 || lines.every((line) => line === "")) {
      return false; // empty block
    }

    const start = lines[0];
    const end = lines[lines.length - 1];

    // Multiline block check (must start with ++type and end with --type)
    const startMatch = start.match(/^\+\+(\w+)(.*)$/);
    const endMatch = end.match(/^\-\-([a-zA-Z]+)$/);
    // console.log(startMatch, endMatch);
    if (startMatch && endMatch) {
      return startMatch[1] === endMatch[1]; // e.g. ++p and --p match
    }

    // If no ++ / -- syntax, treat as a single-line block (not multiline)
    // console.log("lapdkk");
    return (
      lines.length === 1 && !start.startsWith("++") && !start.startsWith("--")
    );
  }

  function markdownToHTML(text) {
    const block = new MarkdownBlock(text);
    return block.toHTML();
  }

  function renderEditorBlock(content, afterElement) {
    if (afterElement == null) container.innerHTML = ""; // Clear old content
    const lines = content.split("\n");

    let buffer = [];

    let wrapper;
    const flush = () => {
      if (buffer.length === 0) return;
      const text = buffer.join("\n").trim();
      if (!text) {
        buffer = [];
        return;
      }

      // console.log(afterElement, content);
      // Create the block DOM
      if (afterElement == null) wrapper = createBlock(text);
      else wrapper = createBlock(text, afterElement);
      const textarea = wrapper.querySelector("textarea");
      const mdDiv = wrapper.querySelector(".markdown");

      // Render the markdown immediately
      const html = markdownToHTML(text);
      mdDiv.innerHTML = html;

      // Hide textarea, show rendered markdown
      textarea.style.display = "none";
      mdDiv.style.display = "block";

      // Wire up click to switch back to edit mode
      mdDiv.addEventListener("click", () => {
        textarea.style.display = "block";
        mdDiv.style.display = "none";
        textarea.focus();
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      });

      buffer = [];
    };

    for (const line of lines) {
      if(buffer.length == 0 && line == "\n") continue;
      buffer.push(line);
      const currentText = buffer.join("\n");
      // console.log("up:  ",currentText);
      if (isCompleteBlock(currentText)) {
        // console.log(currentText);
        // console.log(currentText);
        flush();
      }
    }

    // In case the last block is incomplete but still non-empty
    flush();
    return wrapper;
  }

  // Start with one block
  // createBlock();

  return { createBlock, renderEditorBlock };
};

async function loadSidebar() {
  const [orderRes, contentRes] = await Promise.all([
    fetch("/api/file?name=files_order.txt"),
    fetch("/api/file?name=file_content.json"),
  ]);

  const contentJSON = await contentRes.json();
  const text = await orderRes.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const container = document.getElementById("sidebar-elements");
  container.innerHTML = "";

  let html = "";

  for (const line of lines) {
    const match = line.match(/^(-{1,3})\s+(.*?)\s+(ide\d+)$/);
    if (!match) continue;

    const level = match[1].length;
    const label = match[2].split("_").join(" ");
    const id = match[3];
    const content = contentJSON[id] || "";

    html += `<li class="w3-hover-light-grey" data-file-id="${id}" onclick="loadcontent(this)">`;
    if (level === 1) {
      html += `<span class="w3-padding cursor">${label}</span>`;
      html += `<span class="file-content" style="display:none">${content}</span>`;
    } else {
      for (let i = 0; i < level - 1; i++) {
        html += `<ul class="ul"><li>`;
      }

      html += `<span class="w3-padding cursor">${label}</span>`;
      html += `<span class="file-content" style="display:none">${content}</span>`;

      for (let i = 0; i < level - 1; i++) {
        html += `</li></ul>`;
      }
    }
    html += `</li>`;
  }
  container.innerHTML = html;
  // console.log(html);
}

function loadcontent(liElement) {
  // const id = liElement.dataset.fileId;
  saveinhidden();
  document
    .querySelectorAll("li[data-file-id]")
    .forEach((el) => el.classList.remove("active"));
  liElement.classList.add("active");

  document
    .querySelectorAll("li[data-file-id]")
    .forEach((el) => el.classList.remove("w3-white"));
  liElement.classList.add("w3-white");
  const contentSpan = liElement.querySelector(".file-content");
  const rawContent = contentSpan ? contentSpan.textContent : "";

  editorAPI.renderEditorBlock(rawContent);
  if (rawContent == "") {
    editorAPI.createBlock();
  }
}

async function openOrderEditor() {
  const res = await fetch("/api/file?name=files_order.txt");
  const text = await res.text();
  document.getElementById("orderTextArea").value = text;
  document.getElementById("orderModal").style.display = "block";
}

function closeOrderEditor() {
  document.getElementById("orderModal").style.display = "none";
}

async function submitOrder() {
  const newOrder = document.getElementById("orderTextArea").value;
  const res = await fetch("/api/update-order", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: newOrder,
  });

  if (res.ok) {
    // alert("Order updated!");
    closeOrderEditor();
    loadSidebar(); // Refresh the sidebar
  } else {
    alert("Failed to update order.");
  }
}

async function saveCurrentFile() {
  const container = document.getElementById("container");
  const editors = container.querySelectorAll(".editor textarea");

  const lines = [];
  editors.forEach((textarea) => {
    const content = textarea.value.trim();
    if (content) lines.push(content);
  });

  const finalContent = lines.join("\n");

  const active = document.querySelector("li[data-file-id].active");
  if (!active) {
    alert("⚠️ No file selected to save!");
    return;
  }

  const fileId = active.dataset.fileId;

  // ✅ Update global JSON first
  file_content_json[fileId] = finalContent;

  // ✅ Save entire JSON file
  const res = await fetch("/api/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "file_content.json",
      content: JSON.stringify(file_content_json, null, 2),
    }),
  });

  const result = await res.json();
  alert("✅ File saved!");
  console.log(result);
}

window.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    saveCurrentFile();
    saveinhidden();
  }
});

function saveinhidden() {
  const active = document.querySelector(
    "li[data-file-id].active span.file-content"
  );
  if (!active) {
    // alert("⚠️ No file selected to save!");
    return;
  }

  const container = document.getElementById("container");
  const editors = container.querySelectorAll(".editor textarea");

  const lines_1 = [];
  editors.forEach((textarea) => {
    const content = textarea.value.trim();
    if (content) lines_1.push(content);
  });

  const finalContent = lines_1.join("\n");

  active.innerHTML = finalContent;
}

// copying pasting

let hoveredBlock = null;

document.addEventListener("mouseover", (e) => {
  const block = e.target.closest(".editor");
  if (!block) return;

  hoveredBlock = block;

  if (ctrlPressed && !shiftPressed) {
    block.classList.add("selected");
  }

  if (ctrlPressed && shiftPressed) {
    block.classList.remove("selected");
  }
});

let ctrlPressed = false;
let shiftPressed = false;

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    const templateMap = {
      1: "++p\n\n--p",
      2: "++list\n\n--list",
      3: "++table\n\n--table",
      4: "++div\n\n--div",
    };

    if (templateMap[e.key]) {
      e.preventDefault();
      const textarea = document.querySelector(
        ".editor textarea:not([style*='display: none'])"
      );
      textarea.value = templateMap[e.key];
      textarea.dispatchEvent(new Event("input"));
      textarea.focus();
    }

    // ... your Ctrl+C, V logic here ...
  }

  if (e.key === "Delete" || (e.ctrlKey && e.key === "Backspace")) {
    e.preventDefault();

    const selected = document.querySelectorAll(".editor.selected textarea");
    clipboardBlocks = [...selected].map((t) => t.value);

    // Remove selected blocks from DOM
    document.querySelectorAll(".editor.selected").forEach((el) => el.remove());
  }

  if (e.key === "Control") ctrlPressed = true;
  if (e.key === "Shift") shiftPressed = true;

  if (e.key === "Escape") {
    document
      .querySelectorAll(".editor.selected")
      .forEach((el) => el.classList.remove("selected"));
  }

  if (ctrlPressed && e.key.toLowerCase() === "p") { // paste blocks
    e.preventDefault();
    if (hoveredBlock) {
      pasteBlocks(hoveredBlock);
    }
  }

  if (ctrlPressed && e.key.toLowerCase() === "y") { // copy blocks
    e.preventDefault();
    copySelectedBlocks();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Control") ctrlPressed = false;
  if (e.key === "Shift") shiftPressed = false;
});

let clipboardBlocks = [];

function copySelectedBlocks() {
  const selected = document.querySelectorAll(".editor.selected textarea");
  clipboardBlocks = [...selected].map((t) => t.value);
}

function pasteBlocks(afterElement = null) {
  for (const content of clipboardBlocks) {
    let newBlock = editorAPI.renderEditorBlock(content, afterElement);
    afterElement = newBlock;
  }
}

function printEditor() {
  w3.hide("#navigation");
  w3.addStyle("#editor", "overflow", "visible");
  window.print();
  w3.addStyle("#editor", "overflow", "scroll");
  w3.show("#navigation");
}
