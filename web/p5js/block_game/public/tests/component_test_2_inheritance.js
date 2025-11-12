let comp1;

function setup() {
  createCanvas(400, 400);

  comp1 = new Normal();
  console.log(comp1.get_output());
  comp1.add();
  console.log(comp1.get_output());
}
/*
OUTPUT DESIRED
================
{val: 1}
l1:  5 , a:  5 , inp:  2 , out:  1
{val: 13}
*/

function draw() {
  background(220);
  push();
  fill(colors.red[100]);

  pop();
}

class Normal extends Component {
  constructor() {
    super();
    this.input = { val: 2 };
    this.output = { val: 1 };
    this.l1 = 5;

    this.set_event("add", (kargs) => {
      console.log(
        "l1: ",
        this.l1,
        ", a: ",
        kargs.a,
        ", inp: ",
        this.input.val,
        ", out: ",
        this.output.val
      );
      this.input.val += this.l1 + kargs.a;
      this.output.val += this.input.val;
    });
  }

  add() {
    this.call_event("add", { a: 5 });
  }
}
