let comp1;

function setup() {
  createCanvas(400, 400);

  comp1 = new Component();
  comp1.set_vars("t", 0);
  comp1.set_event("time", () => {
    console.log("Time called");
    let p1 = setInterval(() => {
      comp1.set_vars("t", comp1.get_vars("t") + 1);
      console.log(
        "time Event called again and value change to: ",
        comp1.get_vars("t")
      );
    }, 1000);
    comp1.set_vars("c", p1);
  });

  comp1.set_event("clear_time", () => {
    clearInterval(comp1.get_vars("c"));
  });

  console.log("Value before calling event", comp1.get_vars("t"));
  comp1.call_event("time", {});

  setTimeout(() => {
    comp1.call_event("clear_time");
    console.log(
      "Value after stopping timed event after 10 sec: ",
      comp1.get_vars("t")
    );
  }, 10000);
}
/*
OUTPUT DESIRED
================

Value before calling event 0 
Time called 
time Event called again and value change to:  1  
time Event called again and value change to:  2  
time Event called again and value change to:  3  
time Event called again and value change to:  4  
time Event called again and value change to:  5  
time Event called again and value change to:  6  
time Event called again and value change to:  7  
time Event called again and value change to:  8  
time Event called again and value change to:  9  
time Event called again and value change to:  10  
Value after stopping timed event after 10 sec:  10

*/

function draw() {
  background(220);
  push();
  fill(colors.red[100]);

  pop();
}
