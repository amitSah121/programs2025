class BaseBlock {
  constructor(typeOfBlock, blockSize) {
    this.typeOfBlock = typeOfBlock; // "rectangle" or "circle"
    this.blockSize = blockSize; // Must be 2,4,8,...2^n
    this.attachmentPoints = this.calculateAttachmentPoints();
  }

  calculateAttachmentPoints() {
    return []; // Placeholder, overridden in subclasses
  }
}
