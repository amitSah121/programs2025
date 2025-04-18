// Import the Chuck class from the webchuck package
import { Chuck } from 'webchuck';

// Initialize the ChucK virtual machine
const theChuck = await Chuck.init([]);

// Define your ChucK code as a string
const chuckCode = `
    SinOsc sin => dac;
    440 => sin.freq;
    1::second => now;
`;

// Run the ChucK code
theChuck.runCode(chuckCode);
