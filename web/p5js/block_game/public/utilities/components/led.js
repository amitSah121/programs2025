/*
LED componet
- It accepts a value and changes its internal state if val > 0 then true else false 
- Events:
-- 
*/

class Led extends Component {
  constructor() {
    super();

    this.input = { inp1: 0 }; // inp can be any integer value
    this.state = false;

    this.set_event("update", (e) => {
      if (this.input.inp1 > 0) {
        this.state = true;
      } else {
        this.state = false;
      }
    });
  }
}
