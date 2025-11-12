/*
KeyCOntroller
- inputs
-- inp1 -> the key that will fire the event
-- inp2 -> the type of keyboard event
-- inp3 -> value or object that it can fire

- events
-- called when an input is changed 
*/

class KeyController extends Component {
  constructor() {
    super();

    this.input = { inp1: "a", inp2: "pressed", inp3: 5 };
    this.output = { out1: 0 };
    this.event_present = null;

    this.set_event("change", (e) => {
      this.input.inp1 = e.inp1;

      // remove bound key
      if (this.input.inp2 == "pressed") {
        const index = key_pressed_events.indexOf(this.event_present);
        if (index !== -1) key_pressed_events.splice(index, 1);
      } else if (this.input.inp2 == "released") {
        const index = key_released_events.indexOf(this.event_present);
        if (index !== -1) key_released_events.splice(index, 1);
      }
      //now set key
      this.input.inp2 = e.inp2;
      this.input.inp3 = e.inp3;

      if (this.input.inp2 == "pressed") {
        let pressed = () => {
          if (current_key_pressed == this.input.inp1) {
            this.output.out1 = this.input.inp3;
            this.call_event("wire", { out1: this.output.out1 });
          }
        };
        this.event_present = pressed;
        key_pressed_events.push(pressed);
      } else if (this.input.inp2 == "released") {
        let released = () => {
          if (current_key_released == this.input.inp1) {
            this.output.out1 = this.input.inp3;
            this.call_event("wire", { out1: this.output.out1 });
          }
        };
        this.event_present = released;
        key_released_events.push(released);
      }
    });

    this.call_event("change", { inp1: "a", inp2: "pressed", inp3: 3 });
  }
}
