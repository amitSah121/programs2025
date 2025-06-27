function createMySynthSub(
  componentId,
  name = "Track",
  numInners = 1,
  buttonsPerInner = 1
) {
  const bTemplate = document.getElementById("bottom_ui");
  const bClone = bTemplate.content.cloneNode(true);
  const bContainer = document.querySelector("#timelineView #bottomUi");
  const bWrapper = document.createElement("div");
  bWrapper.id = `bottom_${componentId}`;
  bWrapper.className = "bottom-ui-wrapper";

  const coverTemplate = document.getElementById("bottom_ui_inner_cover");
  const innerTemplate = document.getElementById("bottom_ui_inner");
  const btnTemplate = document.getElementById("bottom_ui_inner_buttons");

  const coverClone = coverTemplate.content.cloneNode(true);
  const coverDiv = coverClone.querySelector("div");

  for (let i = 0; i < numInners; i++) {
    const innerClone = innerTemplate.content.cloneNode(true);
    const bar = innerClone.querySelector(".w3-bar");

    for (let j = 0; j < buttonsPerInner; j++) {
      const btnClone = btnTemplate.content.cloneNode(true);
      bar.appendChild(btnClone);
    }

    coverDiv.appendChild(innerClone);
  }

  bClone.querySelector("span").textContent = name;
  let modal = bClone.querySelector(".w3-modal");
  modal.querySelector("span").onclick = () => {
    modal.style.display = "none";
  };
  bClone.querySelector("span").onclick = () => {
    modal.style.display = "block";
  };
  bClone.querySelector(".w3-pale-red").appendChild(coverDiv);
  bWrapper.appendChild(bClone);
  bContainer.innerHTML = "";
  bContainer.appendChild(bWrapper);

  return bWrapper;
}

function createMySynthComponentUI(
  name = "Track",
  numInners = 1,
  buttonsPerInner = 1
) {
  const componentId = "comp_" + Date.now();

  // Right Sidebar
  const rTemplate = document.getElementById("right_ui");
  const rClone = rTemplate.content.cloneNode(true);
  const rContainer = document.querySelector(
    "#timelineView #r-sidebar #sidebar-elements"
  );
  const rWrapper = document.createElement("div");
  rWrapper.id = componentId;
  rWrapper.onclick = () => {
    project.components.forEach((x) => {
      x.r_ele.classList.remove("selected-component");
    });
    rWrapper.classList.add("selected-component");
    currentComp = project.findComponentById(componentId);
    const bContainer = document.querySelector("#timelineView #bottomUi");
    bContainer.innerHTML = "";
    project.components.forEach((x) => {
      if (x.r_ele.id == componentId) {
        x.b_ele.forEach((y) => {
          bContainer.appendChild(y);
        });
      }
    });
  };
  rWrapper.className = "right-ui-wrapper";
  rWrapper.appendChild(rClone);
  rWrapper.querySelector("span").textContent = name;
  rContainer.appendChild(rWrapper);

  // Bottom UI
  const bWrapper = createMySynthSub(
    componentId,
    name,
    numInners,
    buttonsPerInner
  );

  return {
    id: componentId,
    rightElement: rWrapper,
    bottomElement: bWrapper,
  };
}

function plugMySynthModal(bui, synth) {
  let ui = document.createElement("div");
  ui.innerHTML = MySynthUi;
  bui.querySelector(".w3-modal .w3-container").appendChild(ui);

  let divs = ui.querySelectorAll(".target"); // all sub-panels
  let [osc1, osc1_env, osc2, osc2_env, osc3, osc3_env, filter, lfo, master] =
    divs;

  //   console.log(divs);

  // Utility function to update synth param on custom span change
  function bindNumOption(span, updateFn) {
    if (!span) return;
    span.addEventListener("note-received", (e) => {
      const val = parseFloat(span.dataset.value);
      if (!isNaN(val)) updateFn(val);
    });
  }

  function bindEnumOption(span, updateFn) {
    span.addEventListener("note-received", (e) => {
      updateFn(span.dataset.value);
    });
  }

  function bindCheckbox(input, updateFn) {
    if (!input) return;
    input.addEventListener("change", (e) => updateFn(input.checked));
  }

  // === Oscillators ===
  [osc1, osc2, osc3].forEach((oscDiv, i) => {
    // let { osc, env } = synth.oscillators[i];
    let osc_props = synth.oscs_props;
    const spans = oscDiv.querySelectorAll("span");
    const checkbox = oscDiv.querySelector("input[type=checkbox]");
    bindEnumOption(spans[0], (val) => (osc_props[i].type = val)); // type
    bindNumOption(spans[1], (val) => (osc_props[i].pitch = val)); // pitch
    bindNumOption(spans[2], (val) => (osc_props[i].detune = val)); // detune
    bindNumOption(spans[3], (val) => (osc_props[i].volume = val)); // vol
    // bindCheckbox(checkbox, (val) => {
    //   if (val) osc.start();
    //   else osc.stop();
    // });
    bindNumOption(spans[5], (val) => (osc_props[i].phase = val)); // phase
  });

  // === Envelopes ===
  [osc1_env, osc2_env, osc3_env].forEach((envDiv, i) => {
    const env = synth.oscillators[i].env;
    const spans = envDiv.querySelectorAll("span");

    bindNumOption(spans[0], (val) => (env.attack = val));
    bindNumOption(spans[1], (val) => (env.decay = val));
    bindNumOption(spans[2], (val) => (env.sustain = val));
    bindNumOption(spans[3], (val) => (env.release = val));
  });

  // === Filter ===
  let fSpans = filter.querySelectorAll("span");
  bindNumOption(fSpans[0], (val) => (synth.filter.frequency.value = val));

  // === LFO ===
  let lfoSpans = lfo.querySelectorAll("span");
  let lfoCheckbox = lfo.querySelector("input[type=checkbox]");

  bindEnumOption(lfoSpans[0], (val) => (synth.lfo.type = val));
  bindNumOption(lfoSpans[1], (val) => (synth.lfo.frequency.value = val));
  bindNumOption(lfoSpans[2], (val) => (synth.lfo.amplitude.value = val));
  bindCheckbox(lfoCheckbox, (val) =>
    val ? synth.lfo.start() : synth.lfo.stop()
  );
  bindNumOption(lfoSpans[4], (val) => (synth.lfo.phase = val));

  // === Master ===
  let masterSpans = master.querySelectorAll("span");
  bindNumOption(masterSpans[0], (val) => (synth.masterGain.gain.value = val));
}

function createMySynthComponent(name = "MySynth", project) {
  //   console.log("skks");
  // if(pro)
  const compUI = createMySynthComponentUI(name, 2, 2); // 1 row with 1 param (pan)

  const synth = new MySynth(); // <-- your custom synth instance
  //   synth.connect(Tone.Destination);

  // Optionally store a reference to this component
  const component = new Component(compUI.id);
  component.name = name;
  component.synth = synth;
  component.r_ele = compUI.rightElement;
  component.b_ele.push(compUI.bottomElement);
  component.m_ele = { automations: [], clips: [] };

  plugMySynthModal(compUI.bottomElement, synth);
  // You can push it to a global array if needed

  currentComp = component;
  project.addComponent(component);
  mynumoptions();
  myenumoptions();
}

let MySynthUi = `
<div class="w3-container" style="height: 80vh">
    <span class="w3-padding w3-large">MySynth</span>
    <div
        class="w3-flex w3-margin-top"
        style="gap: 8px; flex-direction: column"
    >
        <!-- osc 1 -->
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label
            ><b>osc 1:</b>
            <span
            class="w3-light-grey my-enum-options"
            data-options='["sine", "triangle","sawtooth","square","pulse","pwm"]'
            data-value="sine"
            >sine</span
            ></label
        >
        <label>
            pitch:
            <span
            class="w3-light-grey my-num-options"
            data-value="440"
            >440</span
            ></label
        >
        <label>
            Detune:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            vol:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            on:
            <input type="checkbox" value="on" checked
        /></label>
        <label>
            phase:
            <span
            class="w3-light-grey my-num-options"
            data-value="0"
            >0</span
            ></label
        >
        </div>
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label><b>osc 1 Envelop: </b> </label>
        <label>
            attack time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.01"
            >0.01</span
            ></label
        >
        <label>
            decay time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.1"
            >0.1</span
            ></label
        >
        <label>
            sustain level:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.8"
            >0.8</span
            ></label
        >
        <label>
            Release time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.5"
            >0.5</span
            ></label
        >
        </div>
        <hr />
        <!-- osc 2 -->
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label
            ><b>osc 2:</b>
            <span
            class="w3-light-grey my-enum-options"
            data-options='["sine", "triangle","sawtooth","square","pulse","pwm"]'
            data-value="sine"
            >sine</span
            ></label
        >
        <label>
            pitch:
            <span
            class="w3-light-grey my-num-options"
            data-value="440"
            >440</span
            ></label
        >
        <label>
            Detune:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            vol:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            on:
            <input type="checkbox" value="on" checked
        /></label>
        <label>
            phase:
            <span
            class="w3-light-grey my-num-options"
            data-value="0"
            >0</span
            ></label
        >
        </div>
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label><b>osc 2 Envelop: </b> </label>
        <label>
            attack time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.01"
            >0.01</span
            ></label
        >
        <label>
            decay time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.1"
            >0.1</span
            ></label
        >
        <label>
            sustain level:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.8"
            >0.8</span
            ></label
        >
        <label>
            Release time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.5"
            >0.5</span
            ></label
        >
        </div>
        <hr />
        <!-- osc 3 -->
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label
            ><b>osc 3:</b>
            <span
            class="w3-light-grey my-enum-options"
            data-options='["sine", "triangle","sawtooth","square","pulse","pwm"]'
            data-value="sine"
            >sine</span
            ></label
        >
        <label>
            pitch:
            <span
            class="w3-light-grey my-num-options"
            data-value="440"
            >440</span
            ></label
        >
        <label>
            Detune:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            vol:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            on:
            <input type="checkbox" value="on" checked
        /></label>
        <label>
            phase:
            <span
            class="w3-light-grey my-num-options"
            data-value="0"
            >0</span
            ></label
        >
        </div>
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label><b>osc 3 Envelop: </b> </label>
        <label>
            attack time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.01"
            >0.01</span
            ></label
        >
        <label>
            decay time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.1"
            >0.1</span
            ></label
        >
        <label>
            sustain level:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.8"
            >0.8</span
            ></label
        >
        <label>
            Release time:
            <span
            class="w3-light-grey my-num-options"
            data-value="0.5"
            >0.5</span
            ></label
        >
        </div>
        <hr />
        <!-- filter -->
        <div
        class="w3-flex target"
        style="gap: 8px; flex-direction: row"
        >
        <label>
            <b>Filter: </b>cutoff:
            <span
            class="w3-light-grey my-num-options"
            data-value="440"
            >440</span
            ></label
        >
        </div>
        <div
        class="w3-flex target"
        style="flex-direction: row; gap: 8px"
        >
        <label
            ><b>LFO:</b>
            <span
            class="w3-light-grey my-enum-options"
            data-options='["sine", "triangle","sawtooth","square","pulse","pwm"]'
            data-value="sine"
            >sine</span
            ></label
        >
        <label>
            pitch:
            <span
            class="w3-light-grey my-num-options"
            data-value="440"
            >440</span
            ></label
        >
        <label>
            amp:
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        <label>
            on:
            <input type="checkbox" value="on" checked
        /></label>
        <label>
            phase:
            <span
            class="w3-light-grey my-num-options"
            data-value="0"
            >0</span
            ></label
        >
        </div>
        <hr />
        <!-- Master -->
        <div
        class="w3-flex target"
        style="gap: 8px; flex-direction: row"
        >
        <label>
            <b>Master Vol: </b>
            <span
            class="w3-light-grey my-num-options"
            data-value="1"
            >1</span
            ></label
        >
        </div>
    </div>
</div>
`;
