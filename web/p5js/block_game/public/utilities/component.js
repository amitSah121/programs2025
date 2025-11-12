/*
What utilities does Component class provide?
- It provides a way to take input, and produce output , as well as setup an event
- call event as desired and with however variables as desired


Input and output Naming convension:
- inp1, inp2, inp3, ... else otherwise stated
- out1, out2, out3, ... else otherwise stated

Event naming convention is not necessary, it must be stated for how it should be used.

Call event "wire" if you want to fire wire event to send something onto other component
      
*/

class Component {
  constructor() {
    this.input = {};
    this.output = {};
    this.variables = {}; // a way to set variables that can interect with functions and events

    this.events = {}; // on an occasion can be called and something changes
  }

  set_input(kargs) {
    // represents variable argument in object form
  }

  set_input(name, value) {
    if (this.input.hasOwnProperty(name)) {
      this.input[name] = value;
    }
  }

  get_output(largs) {
    // if args is null returns all output
    // largs in form of list
    if (largs) {
      let p = {};
      for (let i = 0; i < largs.length; i++) {
        p[largs[i]] = this.output[largs[i]];
      }

      return p;
    }
    return this.output;
  }

  set_vars(kargs) {
    // sets provided vars with name in the arg and its value
  }

  set_vars(name, value) {
    this.variables[name] = value;
  }

  get_vars(name) {
    return this.variables[name];
  }

  remove_vars(largs) {}

  remove_vars(name) {
    delete this.variables[name];
  }

  reset_var_(largs) {
    // largs means args in list form ["a",1,"5"]...
  }

  set_event(kargs) {}

  set_event(name, e) {
    this.events[name] = e;
  }

  get_event(largs) {}

  get_event(name) {
    this.events[name] = e;
  }

  remove_event(name) {
    delete this.events[name];
  }

  call_event(kargs) {
    // kargs in the form {"name",extra_kargs, "name2":..,...}
  }

  call_event(name, extra_kargs) {
    this.events[name].bind(this)(extra_kargs);
  }
}
