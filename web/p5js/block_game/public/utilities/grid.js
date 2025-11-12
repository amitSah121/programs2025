class Grid {
  constructor(cell_w = 10, cell_h = 10, inf = false, x, y, w, h) {
    this.x = 0;
    this.y = 0;
    this.cell_w = cell_w;
    this.cell_h = cell_h;
    this.inf = inf;
    if (!this.inf) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }

  pos(x, y) {
    this.x = x || this.x;
    this.y = y || this.y;
  }

  dim(w, h) {
    this.w = w || this.w;
    this.h = h || this.h;
  }

  delpos(dx, dy) {
    this.x += dx || 0;
    this.y += dy || 0;
  }

  draw(c) {
    push();
    stroke(c);
    if (!this.inf) {
      let xcount = this.w / this.cell_w;
      let ycount = this.h / this.cell_h;
      for (let i = 0; i < xcount; i++) {
        line(
          this.x + i * this.cell_w,
          this.y,
          this.x + i * this.cell_w,
          this.y + this.h
        );
      }
      for (let j = 0; j < ycount; j++) {
        line(
          this.x,
          this.y + j * this.cell_h,
          this.x + this.w,
          this.y + j * this.cell_h
        );
      }
    } else {
      let xcount = width / this.cell_w;
      let ycount = height / this.cell_h;
      //   console.log(xcount, ycount);
      for (let i = 0; i < xcount; i++) {
        line(i * this.cell_w, 0, i * this.cell_w, height);
      }
      for (let j = 0; j < ycount; j++) {
        line(0, j * this.cell_h, width, j * this.cell_h);
      }
    }
    pop();
  }
}
