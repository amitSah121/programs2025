var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/text");
// enable wrap
editor.session.setUseWrapMode(true);

const modelist = ace.require("ace/ext/modelist");

function setEditorModeByFilename(filename) {
    const mode = modelist.getModeForPath(filename).mode;
    editor.session.setMode(mode || "ace/mode/text");
}


var tabs = [];
let activeTab = null;
let counter = 0;

let lastVisitedDir = "";

function create_tab(filename, current_handle){
  if(current_handle == null && (activeTab!==null && activeTab.name != "untitled")){
      saveFile();
  }else if(activeTab!=null && activeTab.name == "untitled"){
    activeTab.text = editor.getValue();
  }
	let newId = counter++;
	let tab = {id:newId,name:filename, handle:current_handle};
  activeTab = tab;
	let f = `<span class="w3-bar-item w3-padding w3- w3-border w3-border-black" onclick="active_tab('${newId}')" data-tab-id="${newId}">${filename}</span>`;
  if(current_handle == null){
    editor.setValue("",-1);
  }
	let p = document.querySelector("#tabs");
	p.innerHTML += f;
	let childs = p.children;
	Array.from(childs).forEach(e => e.classList.remove("w3-light-gray"));
	let f1 = childs[childs.length-1];
	f1.classList.add("w3-light-gray");
  tabs.push(tab);
  if(current_handle == null)
    currentFileHandle = null;
}
 


async function active_tab(id){
  if(activeTab != null && activeTab.name != "untitled")
  	await saveFile();
  else if(activeTab != null){
    activeTab.text = editor.getValue();
  }
  Array.from(document.querySelector("#tabs").children).forEach(tab => {
		if (tab.dataset.tabId == id) {
			tab.classList.add("w3-light-gray");
		} else {
			tab.classList.remove("w3-light-gray");
		}
	});

	
	const tab = tabs.find(tab => tab.id == id);
  activeTab = tab;
    if (tab) {
        currentFileHandle = tab.handle;
      if(activeTab.name != "untitled"){
        const text = await (await currentFileHandle.getFile()).text();
    	editor.setValue(text, -1);
        setEditorModeByFilename(activeTab.name);
        }else{
          editor.setValue(tab.text,-1);
        }
    }
}

 let currentFileHandle = null;
	    
async function openFile() {
  
    [currentFileHandle] = await window.showOpenFilePicker({startIn: lastVisitedDir || 'downloads'});
    const file = await currentFileHandle.getFile();
    const text = await file.text();
    create_tab(file.name, currentFileHandle);
    editor.setValue(text, -1);
    setEditorModeByFilename(file.name);
}


async function reloadDir(){
  try{
    document.querySelector("#file-system").children[0].remove();
      const projectTree = await readDirectoryRecursive(currentProjectFolder);
      currentProjectTree = projectTree;
      let child = renderProjectTree(currentProjectTree);
    document.querySelector("#file-system").innerHTML +=child;
  }catch(e){}
}

async function saveFile() {
    if (!currentFileHandle) {
        // First time, show Save dialog
        currentFileHandle = await window.showSaveFilePicker({
            suggestedName: 'mycode.js',
            types: [{ description: 'JavaScript Files', accept: {'text/javascript': ['.js']} }]
        });
	    if (activeTab) {
	    	activeTab.name = currentFileHandle.name;
        activeTab.handle = currentFileHandle;
	    }
	    let atab = Array.from(document.querySelector("#tabs").children).find(tab=>tab.dataset.tabId==activeTab.id);
	    atab.innerHTML = activeTab.name;
    		 try{
    document.querySelector("#file-system").children[0].remove();
      const projectTree = await readDirectoryRecursive(currentProjectFolder);
      currentProjectTree = projectTree;
      let child = renderProjectTree(currentProjectTree);
    document.querySelector("#file-system").innerHTML +=child;
          }catch(e){}
    	
    }
    const writable = await currentFileHandle.createWritable();
    await writable.write(editor.getValue());
    await writable.close();
    
}

let currentProjectFolder = null;
let currentProjectTree = null;

async function openProjectFolder() {
  if(currentProjectFolder != null){
    document.querySelector("#file-system").children[0].remove();
  }
    currentProjectFolder = await window.showDirectoryPicker({startIn: lastVisitedDir || 'downloads'});
  lastVisitedDir = currentProjectFolder;
    console.log('Project folder opened:', currentProjectFolder.name);

    const projectTree = await readDirectoryRecursive(currentProjectFolder);
    // console.log('Project Tree:', projectTree);

  
    let child = renderProjectTree(projectTree);
    document.querySelector("#file-system").innerHTML +=child;
  currentProjectTree = projectTree;
    return projectTree;
}

// Recursively walk directory
async function readDirectoryRecursive(dirHandle) {
    const tree = {
        name: dirHandle.name,
        kind: 'directory',
        children: []
    };

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            tree.children.push({
                name: entry.name,
                kind: 'file',
                handle: entry
            });
        } else if (entry.kind === 'directory') {
            const subTree = await readDirectoryRecursive(entry);
            tree.children.push(subTree);
        }
    }
    return tree;
}

async function openFileFromProject(filename) {
    if (!currentProjectFolder) return;

    const pathParts = filename.split('/');
    pathParts.shift();
    let currentHandle = currentProjectFolder;

    for (let i = 0; i < pathParts.length - 1; i++) {
        const directoryName = pathParts[i];
        try {
            currentHandle = await currentHandle.getDirectoryHandle(directoryName);
        } catch (e) {
            console.error(`Directory not found: ${directoryName}`);
            return; 
        }
    }

    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const text = await file.text();

    editor.setValue(text, -1);
    currentFileHandle = fileHandle;
    create_tab(fileName, fileHandle);
    setEditorModeByFilename(activeTab.name);

}


function renderProjectTree(tree) {
    if (!tree) return "";

    // Helper recursive renderer
    function renderNode(node, currentPath = "") {
        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;

        if (node.kind === "file") {
            return `<li class="file-item" title="${fullPath}" onClick="openFileFromProject('${fullPath}')" style="overflow:scroll;">${node.name}</li>`;
        } else if (node.kind === "directory") {
            let childrenHTML = node.children.map(child => renderNode(child, fullPath)).join("");
            return `
                <li>
                    <details>
                        <summary>${node.name}</summary>
                        <ul class="w3-ul w3-white">
                            ${childrenHTML}
                        </ul>
                    </details>
                </li>
            `;
        }
    }

    return `
        <ul class="w3-ul w3-white">
            ${renderNode(tree)}
        </ul>
    `;
}


document.getElementById("editor").style.fontSize = "16px";
//------------------
//keys
//---------------

function openHelpModal() {
    document.getElementById("shortcutHelpModal").style.display = "block";
}

function closeHelpModal() {
    document.getElementById("shortcutHelpModal").style.display = "none";
}

window.addEventListener("keydown", e=>{
  const ctrlOrCmd = e.ctrlKey || e.metaKey;

    if (ctrlOrCmd && e.key === "q") {
        e.preventDefault();
        const sidebar = document.querySelector(".w3-sidebar");
        const parentEditor = document.getElementById("parent-editor");
    
        if (!sidebar || !parentEditor) return;
    
        // Check current width
        if (sidebar.style.width === "1px") {
            // Expand
            sidebar.style.width = "250px";
            parentEditor.style.marginLeft = "250px";
        } else {
            // Collapse
            sidebar.style.width = "1px";
            parentEditor.style.marginLeft = "1px";
        }
    }else if (ctrlOrCmd && e.key === "H") {
        openHelpModal();
    }

  
    
    // if (ctrlOrCmd && e.key.toLowerCase() === "n") {
    //     e.preventDefault();
    //     createNewFileInEditor();
    // }

    // if (ctrlOrCmd && e.key.toLowerCase() === "o" && !e.shiftKey) {
    //     e.preventDefault();
    //     openFileFromDialog();
    // }

    // if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "o") {
    //     e.preventDefault();
    //     openProjectFolder();
    // }

    // if (ctrlOrCmd && e.key.toLowerCase() === "w") {
    //     e.preventDefault();
    //     closeCurrentTab();
    // }
  
});
// Save file (Ctrl+S / Cmd+S)
editor.commands.addCommand({
    name: "saveFile",
    bindKey: { win: "Ctrl-Alt-S", mac: "Cmd-S" },
    exec: saveFile
});

editor.commands.addCommand({
    name: "saveFile",
    bindKey: { win: "Ctrl-Alt-R", mac: "Cmd-R" },
    exec: reloadDir
});

// New file (Ctrl+N / Cmd+N)
editor.commands.addCommand({
    name: "newFile",
    bindKey: { win: "Ctrl-Alt-N", mac: "Cmd-N" },
    exec: function(editor) {
        create_tab("untitled",null); // your custom function
    }
});

// Open file (Ctrl+O / Cmd+O)
editor.commands.addCommand({
    name: "openFile",
    bindKey: { win: "Ctrl-O", mac: "Cmd-O" },
    exec: openFile
});

// Open folder (Ctrl+Shift+O)
editor.commands.addCommand({
    name: "openFolder",
    bindKey: { win: "Ctrl-Alt-O", mac: "Cmd-Shift-O" },
    exec: openProjectFolder
});

// Close tab (Ctrl+W / Cmd+W)
editor.commands.addCommand({
    name: "closeTab",
    bindKey: { win: "Ctrl-Alt-W", mac: "Cmd-W" },
    exec: function(editor) {
      let id = activeTab.id;     
      activeTab = null;
      Array.from(document.querySelector("#tabs").children).forEach(tab => {
    		if (tab.dataset.tabId == id) {
    			tab.remove();
    		}
    	});
      let newId = 0;
      let tab_num = -1;
      tabs.forEach(tab=>{
          if (tab.id != id){
            tab_num++;
          }
      });
      if(tab_num != -1){
        newId = tabs[tab_num].id;
      }
      tabs = tabs.filter(tab=> tab.id != id);
      active_tab(newId);
    }
});

