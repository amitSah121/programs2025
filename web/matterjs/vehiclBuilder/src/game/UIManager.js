class UIManager {
    constructor() {
        this.controllerMenu = document.createElement("div");
        this.controllerMenu.id = "controller-menu";
        this.controllerMenu.style.display = "none";
        document.body.appendChild(this.controllerMenu);
        this.createUI();
    }

    showControllerMenu(joint) {
        this.controllerMenu.innerHTML = `
            <label>Select Controller Type:</label>
            <select id="controller-type">
                <option value="rotateCW">Rotate Clockwise</option>
                <option value="rotateCCW">Rotate Counterclockwise</option>
            </select>
            <button id="apply-controller">Apply</button>
        `;

        document.getElementById("apply-controller").onclick = () => {
            let type = document.getElementById("controller-type").value;
            let controller = new BaseController(type, joint);
            controllers.push(controller);
            this.hideControllerMenu();
        };

        this.controllerMenu.style.display = "block";
    }

    hideControllerMenu() {
        this.controllerMenu.style.display = "none";
    }

  
    createUI() {
        this.buildButton = createButton('Build Mode');
        this.buildButton.position(10, 10);
        this.buildButton.mousePressed(() => this.gameManager.setGameMode("build"));

        this.playButton = createButton('Play Mode');
        this.playButton.position(100, 10);
        this.playButton.mousePressed(() => this.gameManager.setGameMode("play"));

        this.saveButton = createButton('Save Vehicle');
        this.saveButton.position(200, 10);
        this.saveButton.mousePressed(() => StorageUtils.saveVehicle());

        this.loadButton = createButton('Load Vehicle');
        this.loadButton.position(300, 10);
        this.loadButton.mousePressed(() => StorageUtils.loadVehicle());
    }

}
