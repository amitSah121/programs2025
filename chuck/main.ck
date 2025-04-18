
[16.352, 17.324, 18.354, 19.445, 20.602, 21.827, 23.125, 24.500, 25.957, 27.500, 29.135, 30.868] @=> float base_note_frequencies[]; 
["c_", "c#", "d_", "d#", "e_", "f_", "f#", "g_", "g#", "a_", "a#", "b_"] @=> string note_names[];



class Utility{
    float base_note_frequencies[];
    string note_names[];

    fun Utility(float base_note_frequencies[], string note_names[]){
        base_note_frequencies @=> this.base_note_frequencies;
        note_names @=> this.note_names;
    }

    fun int findArr(string arr[], string target) {
        for (0 => int i; i < arr.cap(); i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    fun float[] findNote(string note){ // A_1,A#2

        note.substring(0,2) => string note_alpha;
        note_alpha.lower() => note_alpha;
        note.substring(2,1) => string octaveStr;
        Std.atof(octaveStr) => float octave;

        this.findArr(this.note_names, note_alpha) $ float => float index;

        return [index, octave];
    }

}

class CustomEnvelops{

    fun void basicADSRSet(Envelope env, float attack[], float decay[], float sustain[], float release[]){
        // float[] in the [duration, level] 
        
        // Attack phase
        attack[1] => env.target;
        attack[0]::second => env.duration;
        attack[0]::second => now;

        // Decay phase
        decay[1] => env.target;
        decay[0]::second => env.duration;
        decay[0]::second => now;

        // Sustain (hold for a while)
        sustain[1] => env.target;
        sustain[0]::second => now;

        // Release phase
        release[1] => env.target;
        release[0]::second => env.duration;
        release[0]::second => now;

    }

    fun void piano(Envelope env, float held){
         [0.01, 1.0] @=> float attack[]; // [duration, level]
        [0.2, 0.5] @=> float decay[];   // [duration, level]
        [0.3, held-(1.0+0.5)] @=> float sustainLevel[];
        [0.0 ,1.0] @=> float release[];

        // Apply the ADSR envelope
        this.basicADSRSet(env, attack, decay, sustainLevel, release);
    }

}

new Utility(base_note_frequencies, note_names) @=> Utility utility;
new CustomEnvelops @=> CustomEnvelops envs;



fun void note(string note, float gain, float held){
    utility.findNote(note) @=> float args[];

    if(args[0] == -1){
        <<<"There is no such note as ", note>>>;
    }

    args[0] $ int => int temp;
    base_note_frequencies[temp] => float note_freq;
    note_freq * Math.pow(2, args[1]+1) => note_freq;

    // <<< note_freq, gain , args[1]>>>;

    SinOsc n => Envelope env => dac;
    note_freq => n.freq;
    gain => n.gain;
    envs.piano(env, held);

    held::second => now;
}

fun playNote(string notes[], float maxDur){
    for( 0 => int i ; i<notes.size() ; i++){
        spork ~ note(notes[i], 0.2, maxDur);
        <<<notes[i], 0.2, maxDur>>>;
    }

    me.yield();
    (maxDur+0.6)::second => now;
}

playNote(["c_4", "e_4", "g_4"], 0.2);
playNote(["a_4", "b_4", "d_5"], 0.1);
playNote(["c_4", "e_4", "g_4"], 0.2);


// spork ~ note("c_4", 0.2, 2);
// spork ~ note("e_4", 0.2, 2);
// spork ~ note("g_4", 0.2, 2);

// me.yield();
// 2::second => now;



