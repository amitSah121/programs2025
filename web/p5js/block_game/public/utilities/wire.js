/*
It works like a wire to join two components together.
How it works:
- it is called whenever "wire" event is fired by a component
- when it is created it takes two components as input and joins them together and also describes a "wire" event in each given their way respectively

assumptions
- comp1's output = comp2's input number
- outputs and inputs are serially ordered, since they are sorted when joining
- comp1 receives the "wire" event to pass output to comp2
- "update" is called on comp2 after inputs been updated
*/

class Wire {
  constructor(comp1, comp2) {
    // comp1's output joins to comp2 inputs
    comp1.set_event("wire", (e) => {
      const keys = Object.keys(e);
      keys.sort();
      const com2_keys = Object.keys(comp2.input);
      com2_keys.sort();

      for (let i = 0; i < keys.length; i++) {
        comp2.set_input(com2_keys[i], comp1.get_output([keys[i]])[keys[i]]);
      }

      comp2.call_event("update", {});
    });
    comp2.set_event("wire", () => {});
  }
}
