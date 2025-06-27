class CircleBlock extends BaseBlock {
  constructor(blockSize) {
    super("circle", blockSize);
  }

  calculateAttachmentPoints() {
    let radius = this.blockSize / 2;
    return [
      new AttachmentPoint(0, -radius, 0), // Top
      new AttachmentPoint(radius, 0, 1), // Right
      new AttachmentPoint(0, radius, 2), // Bottom
      new AttachmentPoint(-radius, 0, 3), // Left
      new AttachmentPoint(0, 0, 4), // Center
    ];
  }
}
