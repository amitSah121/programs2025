(async () => {
  let { apps } = await listApps();
  let main = document.querySelector("#desktop");

  for (let i = 0; i < apps.length; i++) {
    let app = apps[i];

    // container for each app
    let appDiv = document.createElement("div");
    appDiv.style.width = "100px";
    appDiv.style.margin = "10px";
    appDiv.style.textAlign = "center";
    appDiv.style.float = "left";
    appDiv.style.cursor = "pointer";
    // appDiv.style.position = "absolute";

    // circle (app icon)
    let circle = document.createElement("div");
    circle.style.width = "60px";
    circle.style.height = "60px";
    circle.style.borderRadius = "50%";
    circle.style.margin = "0 auto";
    circle.style.background = "#007BFF"; // default blue color
    circle.style.display = "flex";
    circle.style.alignItems = "center";
    circle.style.justifyContent = "center";
    circle.style.color = "white";
    circle.style.fontWeight = "bold";
    circle.textContent = app.toUpperCase();

    // label (app name)
    let label = document.createElement("div");
    label.textContent = app;
    label.style.marginTop = "8px";
    label.style.fontSize = "14px";
    label.style.wordWrap = "break-word";

    // add click handler
    appDiv.addEventListener("click", () => {
      console.log("Clicked:", app.name);
      openApp(app); // if you have a function to open it
    });

    // append to appDiv and main
    appDiv.appendChild(circle);
    appDiv.appendChild(label);
    main.appendChild(appDiv);
  }
})();

function openApp(name) {
  (async () => {
    try {
      window.appName = name;
      await loadAppInIframe(name, {
        publicFiles: ["/res/lib/custom/file_api.js", "/res/lib/p5/p5.min.js"],
      });
    } catch (err) {
      console.error("Error:", err.message);
    }
  })();
}
