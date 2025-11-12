const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera(
  "camera",
  Math.PI / 2,
  Math.PI / 4,
  4,
  BABYLON.Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(1, 1, 0),
  scene
);

const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
const ground = BABYLON.MeshBuilder.CreateGround("ground", {
  width: 10,
  height: 10,
});

const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
  "textures/sky/skybox",
  scene
);
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
skybox.material = skyboxMaterial;

let time = 0;

engine.runRenderLoop(() => {
  scene.render();
  time += 0.01;
  //   console.log(time);
  //   box.position.y = Math.sin(time);
  box.rotation.y = Math.sin(time);
});
