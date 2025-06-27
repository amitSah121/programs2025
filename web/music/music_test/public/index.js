const synth = new Tone.Synth().toDestination();

document.querySelector("#play").addEventListener("click", () => {
  const now = Tone.now();
  synth.triggerAttack("C4", "4n");
  // synth.triggerAttack("D4", "6n");
  synth.triggerAttack("E4", "8n");
  // synth.triggerRelease(now + 1);
});

console.log(synth.volume);

// generate a single channel, 0.5 second buffer
const context = new Tone.OfflineContext(1, 0.5, 44100);
const osc = new Tone.Oscillator({ context });
context.render().then((buffer) => {
  console.log(buffer);
});
