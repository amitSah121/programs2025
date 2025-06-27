class MySynth {
  constructor(options = {}) {
    this.name = "MySynth";

    // External patch points
    this.input = new Tone.Gain(); // You can feed signals into this
    this.output = new Tone.Gain(); // Final output

    // Master envelope and gain
    this.masterEnv = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 1.0,
      ...options.masterEnv,
    });

    this.masterGain = new Tone.Gain(0.9);

    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: 440,
      Q: 1,
    });

    this.lfo = new Tone.LFO("4n", 400, 4000);
    this.lfo.connect(this.filter.frequency).start();

    // Oscillator units
    this.oscs_props = [
      { type: "sine", pitch: 440, detune: 0, volume: 1, phase: 1 },
      { type: "sine", pitch: 440, detune: 0, volume: 1, phase: 1 },
      { type: "sine", pitch: 440, detune: 0, volume: 1, phase: 1 },
    ];
    this.oscillators = [0, 1, 2].map(() => {
      let osc = new Tone.Oscillator("C4", "sine").start();
      osc.type = "sine";
      const env = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5,
      });

      osc.connect(env);
      env.connect(this.masterEnv);
      return { osc, env };
    });

    // Final internal patching
    this.input.chain(this.masterEnv, this.filter, this.masterGain, this.output);
  }

  /**
   * Dynamically reconfigure internal connections.
   * You can turn off oscillator connections, LFO, etc.
   */
  repatchInternal({
    osc1 = true,
    osc2 = true,
    osc3 = true,
    lfo = true,
    filter = true,
    env = true,
  } = {}) {
    // Disconnect everything first
    this.oscillators.forEach(({ osc, env }) => {
      osc.disconnect();
      env.disconnect();
    });
    this.lfo.disconnect();
    this.input.disconnect();
    this.masterEnv.disconnect();
    this.filter.disconnect();
    this.masterGain.disconnect();

    // Reconnect based on params
    const reconnectEnv = (envNode) => {
      if (filter) {
        envNode.connect(this.masterEnv);
      } else {
        envNode.connect(this.masterGain);
      }
    };

    if (osc1) {
      this.oscillators[0].osc.connect(this.oscillators[0].env);
      reconnectEnv(this.oscillators[0].env);
    }
    if (osc2) {
      this.oscillators[1].osc.connect(this.oscillators[1].env);
      reconnectEnv(this.oscillators[1].env);
    }
    if (osc3) {
      this.oscillators[2].osc.connect(this.oscillators[2].env);
      reconnectEnv(this.oscillators[2].env);
    }

    if (lfo) {
      this.lfo.connect(this.filter.frequency);
    }

    // Connect input chain
    if (filter) {
      this.input.chain(
        this.masterEnv,
        this.filter,
        this.masterGain,
        this.output
      );
    } else {
      this.input.chain(this.masterEnv, this.masterGain, this.output);
    }
  }

  triggerAttack(note, time = Tone.now(), velocity = 1) {
    const freq = Tone.Frequency(note).toFrequency();

    this.oscillators.forEach((oscData, i) => {
      const oldOsc = oscData.osc;
      const env = oscData.env;
      //   console.log(this.oscs_types);
      // Disconnect and dispose of the old oscillator
      if (oldOsc) {
        oldOsc.stop(time);
        oldOsc.disconnect();
      }

      // Create new oscillator with phase reset
      const newOsc = new Tone.Oscillator({
        frequency: freq, //this.oscs_props[i].pitch,
        type: this.oscs_props[i].type, // Or use oscData.type if you support multiple types
        phase: this.oscs_props[i].phase,
        volume: this.oscs_props[i].volume,
      });

      // Connect new oscillator to envelope
      newOsc.connect(env);
      newOsc.start(time);

      // Update the reference in the array
      this.oscillators[i].osc = newOsc;

      // Trigger envelope
      env.triggerAttack(time);
    });

    this.masterEnv.triggerAttack(time);
  }

  triggerRelease(time = Tone.now()) {
    this.oscillators.forEach(({ env }) => env.triggerRelease(time));
    this.masterEnv.triggerRelease(time);
  }

  triggerAttackRelease(note, duration, time = Tone.now(), velocity = 1) {
    this.triggerAttack(note, time, velocity);
    this.triggerRelease(Tone.Time(duration).toSeconds());
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  dispose() {
    this.oscillators.forEach(({ osc, env }) => {
      osc.dispose();
      env.dispose();
    });
    this.masterEnv.dispose();
    this.masterGain.dispose();
    this.filter.dispose();
    this.lfo.dispose();
    this.input.dispose();
    this.output.dispose();
    return this;
  }
}
