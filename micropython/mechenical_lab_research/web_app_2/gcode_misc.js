function interpolateSteps(distance, maxStep = 4, steps) {
    if (steps === 0 || distance === 0) return Array(steps).fill(0);
    
    // Convert to integer if it's not already
    const intDistance = Math.round(distance);
    
    // Create an array of base values (floor division)
    const baseStep = Math.floor(intDistance / steps);
    let stepValues = Array(steps).fill(baseStep);
    
    // Calculate the remainder to distribute
    let remainder = intDistance - (baseStep * steps);
    
    // Distribute the remainder one unit at a time
    for (let i = 0; remainder > 0; i = (i + 1) % steps) {
        stepValues[i]++;
        remainder--;
    }
    
    // If distance was negative, make all steps negative
    if (distance < 0) {
        stepValues = stepValues.map(val => -val);
    }
    
    return stepValues;
}

function parseGcode(gcodeString) {
    let gcodeData = [];
    let apiCalls = [];
    
    let lines = gcodeString.split("\n");
    
    for (let line of lines) {
        line = line.split(';')[0].trim();  // Remove comments
        if (!line) continue;  // Ignore empty lines
        
        if (line.startsWith('M')) {
            apiCalls.push(`/api/${line.replace(/\s+/g, '/')}`);
        } else if (line.startsWith('G')) {
            let params = { X: 0, Y: 0, Z: 0, E: 0, F: 1000 };
            let matches = [...line.matchAll(/([XYZEF])([-+]?\d*\.?\d+)/g)];
            
            for (let [_, key, value] of matches) {
                params[key] = parseFloat(value);
            }
            
            // Determine the maximum number of steps needed based on the largest movement
            const movements = ['X', 'Y', 'Z', 'E'].map(key => Math.abs(Math.round(params[key] || 0)));
            const maxMovement = Math.max(...movements);
            const steps = Math.max(1, Math.ceil(maxMovement / 4));
            
            // Calculate interpolated steps for each axis, distributing evenly
            let interpolatedSteps = {};
            for (let key of ['X', 'Y', 'Z', 'E']) {
                interpolatedSteps[key] = interpolateSteps(params[key] || 0, 4, steps);
            }
            
            // Generate data for each step
            for (let i = 0; i < steps; i++) {
                let stepValues = {};
                for (let key of ['X', 'Y', 'Z', 'E']) {
                    stepValues[key] = interpolatedSteps[key][i] || 0;
                }
                
                let motor = ['X', 'Y', 'Z', 'E'].map(k => (stepValues[k] !== 0 ? 1 : 0)).concat([0]);
                let distance = ['X', 'Y', 'Z', 'E'].map(k => Math.abs(stepValues[k])).concat([0]);
                let run = ['X', 'Y', 'Z', 'E'].map(k => (stepValues[k] >= 0 ? 1 : 0)).concat([0]);
                
                gcodeData.push([...motor, ...distance, ...run]);
            }
        }
    }
    
    let csvOutput = "motorx,motory,motorz,motors1,motors2,distancex,distancey,distancez,distances1,distances2,runx,runy,runz,runs1,runs2\n";
    csvOutput += gcodeData.map(row => row.join(",")).join("\n");
    
    let apiOutput = apiCalls.join("\n");
    
    return { csvOutput, apiOutput };
}

// // Example usage:
// const gcodeString = `
// M104 S200
// M140 S60
// G28
// G1 X10 Y10 E5 F1500
// G1 X50 Y50 E10
// `;
// const { csvOutput, apiOutput } = parseGcode(gcodeString);
// console.log(csvOutput);
// console.log(apiOutput);