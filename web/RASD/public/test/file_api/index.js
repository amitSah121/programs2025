// // Sketch 1
// const sketch1 = (p) => {
//   p.setup = () => {
//     p.createCanvas(200, 200);
//     p.background(200, 100, 100);
//   };

//   p.draw = () => {
//     p.fill(255);
//     p.ellipse(p.mouseX, p.mouseY, 20, 20);
//   };
// };

// // Attach to DOM elements
// new p5(sketch1, "sketch1");
window.appName = "car_game";
(async () => {
  let content, fileh, dirh;
  console.log("Get File");
  fileh = await getFile("config"); // handler
  console.log("Handler: ", fileh);
  content = await readFile(fileh.path);
  console.log(`File:${fileh.path} with content: ${content}`);
  fileh = await createFile("newConfig");
  console.log("Handler: ", fileh);
  console.log("Writing file: ", fileh.path);
  await writeFile(fileh.path, "Its new config file for our application.");
  content = await readFile(fileh.path);
  console.log("Read file: ", fileh.path, " and content saved is:", content);
  await copyFile(fileh.path, "newnewconfig");
  await renameFile("newnewconfig", "now_new_config");
  await moveFile("newConfig", "lib/newConfig");
  await deleteFile("lib/newConfig");
  await deleteFile("now_new_config");

  dirh = await createDir("newDir");
  fileh = await createFile(dirh.path + "/newconfig");
  await writeFile(fileh.path, "Hello new dir");
  await moveDir("newDir", "newNewdir");
  await deleteDir("newNewdir");
  content = await getDirTree();
  console.log(content);
})();

window.appName = "car_game";
(async () => {
  let content, fileh, dirh;
  console.log("Get File");
  fileh = await getFilePrivate("config"); // handler
  console.log("Handler: ", fileh);
  content = await readFilePrivate(fileh.path);
  console.log(`File:${fileh.path} with content: ${content}`);
  fileh = await createFilePrivate("newConfig");
  console.log("Handler: ", fileh);
  console.log("Writing file: ", fileh.path);
  await writeFilePrivate(
    fileh.path,
    "Its new config file for our application."
  );
  content = await readFilePrivate(fileh.path);
  console.log("Read file: ", fileh.path, " and content saved is:", content);
  await copyFilePrivate(fileh.path, "newnewconfig");
  await renameFilePrivate("newnewconfig", "now_new_config");
  await moveFilePrivate("newConfig", "lib/newConfig");
  await deleteFilePrivate("lib/newConfig");
  await deleteFilePrivate("now_new_config");

  dirh = await createDirPrivate("newDir");
  fileh = await createFilePrivate(dirh.path + "/newconfig");
  await writeFilePrivate(fileh.path, "Hello new dir");
  await moveDirPrivate("newDir", "newNewdir");
  await deleteDirPrivate("newNewdir");
  content = await getDirTree();
  console.log(content);
})();

// Usage example
async function showImage(filePath, imgElementId) {
  const blob = await readFileBytes(filePath);
  const url = URL.createObjectURL(blob);
  document.getElementById(imgElementId).src = url;
}

showImage("res/images/4.png", "image");

// Suppose you have a canvas
const canvas = document.getElementById("paint");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "skyblue";
ctx.fillRect(0, 0, canvas.width, canvas.height); // background

ctx.fillStyle = "yellow";
ctx.beginPath();
ctx.arc(200, 200, 50, 0, Math.PI * 2); // sun
ctx.fill();

ctx.fillStyle = "green";
ctx.fillRect(0, 350, 400, 50); // ground

ctx.fillStyle = "red";
ctx.fillRect(150, 250, 100, 100); // house

ctx.fillStyle = "brown";
ctx.fillRect(180, 300, 40, 50); // door

// --- Save button ---
document.getElementById("save").addEventListener("click", async () => {
  canvas.toBlob(async (blob) => {
    await createFile("drawing.png");
    if (!blob) {
      console.error("Blob conversion failed!");
      return;
    }

    const arrayBuffer = await blob.arrayBuffer(); // This is fine
    // console.log(arrayBuffer);
    await writeFileByte("drawing.png", arrayBuffer);
  });
});

async function testPipe() {
  try {
    // write
    const writeRes = await writePipe("myPipe", "Hello Pipe!");
    console.log(writeRes.message, "Length:", writeRes.length);

    // read
    const readRes = await readPipe("myPipe");
    if (readRes.data) {
      console.log("Read from pipe:", readRes.data);
    } else {
      console.log(readRes.message);
    }
  } catch (err) {
    console.error(err.message);
  }
}

testPipe();
