class InputHandler {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.selectedBlockType = null;
        this.placingBlock = null;

        this.initMouseEvents();
    }

    initMouseEvents() {
        document.addEventListener("mousedown", (event) => this.onMouseDown(event));
        document.addEventListener("mousemove", (event) => this.onMouseMove(event));
    }

    onMouseDown(event) {
        if (this.selectedBlockType) {
            let position = this.getSnappedPosition(event.clientX, event.clientY);
            let newBlock = new SquareBlock(position.x, position.y, this.gridSize);
            squareBlocks.push(newBlock);
            this.placingBlock = null;
        }
    }

    onMouseMove(event) {
        if (this.selectedBlockType) {
            let position = this.getSnappedPosition(event.clientX, event.clientY);
            this.placingBlock = new SquareBlock(position.x, position.y, this.gridSize);
        }
    }

    getSnappedPosition(x, y) {
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

  snapToGrid(x, y) {
    return {
        x: Math.round(x / this.gridSize) * this.gridSize,
        y: Math.round(y / this.gridSize) * this.gridSize
    };
  }

    setSelectedBlock(type) {
        this.selectedBlockType = type;
    }
}

