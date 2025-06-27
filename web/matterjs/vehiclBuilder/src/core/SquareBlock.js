class SquareBlock extends BaseBlock {
  constructor(blockSize) {
    super("rectangle", blockSize);
  }

  calculateAttachmentPoints() {
    let points = [];
    let step = this.blockSize / 2;
    for (let i = -step; i <= step; i += step * 2) {
      points.push(new AttachmentPoint(i, -step, 0)); // Top
      points.push(new AttachmentPoint(i, step, 2)); // Bottom
      points.push(new AttachmentPoint(-step, i, 3)); // Left
      points.push(new AttachmentPoint(step, i, 1)); // Right
    }
    return points;
  }
  
  serialize() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
  
  static deserialize(data) {
      return new SquareBlock(data.x, data.y, data.w, data.h);
  }

}

