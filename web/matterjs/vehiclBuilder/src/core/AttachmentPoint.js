
class AttachmentPoint {
  constructor(x, y, sideNum) {
    this.x = x;
    this.y = y;
    this.sideNum = sideNum; // 0 = Top, 1 = Right, 2 = Bottom, 3 = Left, 4 = Center (Circle Only)
  }
  
  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 8, 8);
  }
  
  
}
