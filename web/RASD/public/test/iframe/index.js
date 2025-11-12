window.appName = "car_game";
(async () => {
  console.log(await listApps());
})();

(async () => {
  const { app, files } = await loadAppConfig("car_game");
  console.log(`App: ${app}`);
  console.log("Files to include:", files);

  // Example: dynamically load into iframe or directly:
  // files.forEach(f => loadScript(`/apps/${app}/${f}`));
})();

(async () => {
  try {
    await loadAppInIframe("car_game", {
      publicFiles: ["/res/lib/custom/file_api.js"],
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
})();

(async () => {
  try {
    await loadAppInIframe("car_game", {
      publicFiles: ["/res/lib/custom/file_api.js"],
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
