class Pipe {
  constructor(name) {
    this.name = name;
    this.list = [];
  }

  length() {
    return this.list.length;
  }

  write(data) {
    this.list.push(data); // enqueue
  }

  read() {
    return this.list.shift(); // dequeue
  }

  peek() {
    return this.list[0];
  }
}

function getPipe(name, pipe_handlers) {
  let pipe = pipe_handlers.find((p) => p.name === name);
  if (!pipe) {
    pipe = new Pipe(name);
    pipe_handlers.push(pipe);
  }
  return pipe;
}

module.exports = { Pipe, getPipe };
