let bgFiles = [];
let bgIndex = 0;
let bgElements = []; // store loaded p5 images/videos
let switchTime = 2000;
let lastSwitch = 0;

async function setupBackground() {
  // Fetch file list
  const res = await fetch("/api/background/list");
  const { files } = await res.json();
  bgFiles = files;

  // Fetch config
  try {
    const confRes = await fetch("/api/background/config");
    const json = await confRes.json();
    switchTime = json["time"];
    // console.log(json);
  } catch {
    console.log("Config not found");
  }

  // Preload all backgrounds
  await Promise.all(
    bgFiles.map(async (file) => {
      const res = await fetch(
        `/api/background/readByte?name=${encodeURIComponent(file)}`
      );
      const blob = await res.blob();
      const type = blob.type;

      if (type.startsWith("image/")) {
        return new Promise((resolve) => {
          const url = URL.createObjectURL(blob);
          loadImage(url, (img) => {
            bgElements.push(img);
            URL.revokeObjectURL(url);
            resolve();
          });
        });
      } else if (type.startsWith("video/")) {
        return new Promise((resolve) => {
          const url = URL.createObjectURL(blob);
          const vid = createVideo(url);
          vid.loop();
          vid.hide();
          bgElements.push(vid);
          resolve();
        });
      }
    })
  );
}

async function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("main");
  await setupBackground();
  //   console.log(bgFiles, bgIndex, bgElements, switchTime, lastSwitch);
}

function draw() {
  background(0);
  if (bgElements.length === 0) return;

  const bg = bgElements[bgIndex];
  if (bg instanceof p5.Element) {
    image(bg, 0, 0, width, height);
  } else {
    image(bg, 0, 0, width, height);
  }

  if (millis() - lastSwitch > switchTime) {
    lastSwitch = millis();
    bgIndex = (bgIndex + 1) % bgElements.length;
  }
}
