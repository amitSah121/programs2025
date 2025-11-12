console.log("Hello world");
window.appName = "car_game";
(async () => {
  console.log(await readFile("main.js"));
})();
