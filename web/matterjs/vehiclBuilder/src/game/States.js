const squareBlocks = [];
const circleBlocks = [];
const maskingJoints = [];
const nonMaskingJoints = [];
const controllers = [];

function addBlock(block) {
  if (block instanceof SquareBlock) {
    squareBlocks.push(block);
  } else if (block instanceof CircleBlock) {
    circleBlocks.push(block);
  }
}

function removeBlock(block) {
  if (block instanceof SquareBlock) {
    squareBlocks.splice(squareBlocks.indexOf(block), 1);
  } else if (block instanceof CircleBlock) {
    circleBlocks.splice(circleBlocks.indexOf(block), 1);
  }
}

function addJoint(joint, masking = false) {
  if (masking) {
    maskingJoints.push(joint);
  } else {
    nonMaskingJoints.push(joint);
  }
}

function removeJoint(joint) {
  let index = maskingJoints.indexOf(joint);
  if (index !== -1) {
    maskingJoints.splice(index, 1);
    return;
  }
  index = nonMaskingJoints.indexOf(joint);
  if (index !== -1) {
    nonMaskingJoints.splice(index, 1);
  }
}

function addController(controller) {
  controllers.push(controller);
}

function removeController(controller) {
  const index = controllers.indexOf(controller);
  if (index !== -1) {
    controllers.splice(index, 1);
  }
}
