const synth = new Tone.Synth().toDestination();
const freqSlider = document.getElementById("freqSlider");
const freqValue = document.getElementById("freqValue");

// let frequency = 440;

// freqSlider.oninput = () => {
//   frequency = parseFloat(freqSlider.value);
//   freqValue.textContent = frequency;
// };

// document.getElementById("playBtn").onclick = async () => {
//   await Tone.start(); // Required for Chrome autoplay policy
//   synth.triggerAttackRelease(frequency, "8n");
// };



const list_notes = ["C4","D4","E4","F4","G4","A4","B4","C3","D3","E3","F3","G3","A3","B3","C2"];
const sampler = new Tone.Sampler({
    urls: {
      C4: "kick1.wav",
      D4: "kick2.wav",
      E4: "snare.wav",
      F4: "maracas.wav",
      G4: "tom1.wav",
      A4: "rimshot.wav",
      B4: "open_hh.wav",
      C3: "hightom.wav",
      D3: "hi_conga.wav",
      E3: "handclap.wav",
      F3: "crashcym.wav",
      G3: "cowbell.wav",
      A3: "conga1.wav",
      B3: "claves.wav",
      C2: "cl_hihat.wav",
    },
    baseUrl: "res/808/", // Path to folder
  }).toDestination();

let btns = document.querySelectorAll("#btns span");

// for(let i=0 ; i<btns.length ; i++){
  
//   btns[i].onclick = async () => {
//     await Tone.start();
//     sampler.triggerAttackRelease(list_notes[i], "1n");
//   };
// }

btns[0].onclick = async () =>{
  await Tone.start();
  sampler.triggerAttackRelease(["E3","G3","A3"],"1n");
}

let patt_store = {};
let patts_name = ["kick1","kick2","snare","maracas","tom1","rimshot","open_hh","hightom","hi_conga","handclap","crashcym","cowbell","conga1","claves","cl_hihat"]
let patts = [];
for(let i=0 ; i<patts_name.length ; i++){
  patts.push(document.querySelector("#"+patts_name[i]));
  patt_store[patts_name[i]] = [];
}

for(let j=0 ; j<patts_name.length ; j++){
  let patt = patt_store[patts_name[j]];
  let inst = patts[j];
  for(let i=0; i<16 ; i++){
    patt.push(0);
    const span = document.createElement("button");
    span.className = "w3-bar-item w3-green w3-hover-blue-gray w3-border";
    span.textContent = "-";
    span.addEventListener("click", () => {
      if(patt[i] == 0){
        patt[i] = 1;
        span.classList.remove("w3-green");
        span.classList.add("w3-red");
      }else{
        patt[i] = 0;
        span.classList.remove("w3-red");
        span.classList.add("w3-green");
      }
    });
    
    inst.appendChild(span);
  }
}




let playing = false;
let interval_ctrl;
let timestep = 60*1000/120;
let currentInterv = 0;

document.getElementById("bpm").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue > 0) {
      timestep = 60*1000/newValue;
      clearInterval(interval_ctrl);
      interval_ctrl = setInterval(patt_player, 16*timestep);
    }
  }
});


document.querySelector("#play").addEventListener("click", () => {
  if (!playing) {
    playing = true;
    patt_player();
    interval_ctrl = setInterval(patt_player, 16*timestep);
    document.querySelector("#play").textContent = "Stop";
  } else {
    clearInterval(interval_ctrl);
    playing = false;
    document.querySelector("#play").textContent = "Play";
  }
});

let patt_player = ()=>{
  for(let j=0 ; j<patts_name.length ; j++){
    patt = patt_store[patts_name[j]];
    let inst_btns = Array.from(patts[j].children);
    // console.log(patts_name[j]);
    inst_btns.shift();
    currentInterv = 0;
    for(let i=0; i<16 ; i++){
      currentInterv += timestep;
      // console.log(patt);
      if(patt[i] == 1){
        setTimeout(async ()=>{
          await Tone.start();
          sampler.triggerAttackRelease(list_notes[j], "1n");
          // console.log(list_notes[j]);
        },currentInterv);
      }
    }
  }
}

// console.log(patt_store)