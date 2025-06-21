let boardSize = 8;
let tileSize;
let pieces;
let selectedCell = null;
let moveHistory = [];
let currentPlayer = 'white';


function setup() {
  createCanvas(400, 450);
  tileSize = width / boardSize;
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.75);
  textFont('Arial Unicode MS, Noto Sans Symbols, serif');


  // Unicode chess symbols
  pieces = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'], // 0: Black
    ['♟','♟','♟','♟','♟','♟','♟','♟'], // 1
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'], // 6: White
    ['♖','♘','♗','♕','♔','♗','♘','♖']  // 7: White
  ];


  // movePiece(1, 0, 3, 0); // legal (white pawn)
  // movePiece(0, 1, 2, 2); // legal (white knight)
  // movePiece(0, 0, 2, 2); // illegal (rook diagonal)

}

function isWhitePiece(piece) {
  return ['♙','♖','♘','♗','♕','♔'].includes(piece);
}


function draw() {
  background(255);
  drawBoard();
  drawPieces();
  highlightSelected();
  push();
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Turn: " + currentPlayer, 10, width+10);
  pop()
}

function highlightSelected() {
  if (selectedCell) {
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();
    rect(selectedCell.col * tileSize, selectedCell.row * tileSize, tileSize, tileSize);
    noStroke();
  }
}

function saveBoardState() {
  // Deep copy
  let snapshot = pieces.map(row => row.slice());
  moveHistory.push(snapshot);
}


function mousePressed() {
  let col = floor(mouseX / tileSize);
  let row = floor(mouseY / tileSize);

  if (col < 0 || col >= 8 || row < 0 || row >= 8) return;

  if (selectedCell == null) {
    let piece = pieces[row][col];
    if (piece !== '' && isCurrentPlayerPiece(piece)) {
      selectedCell = { row, col };
    }
  } else {
    let from = selectedCell;
    let to = { row, col };
    if (movePiece(from.row, from.col, to.row, to.col)) {
      switchPlayer(); // switch only if move was valid
    }
    selectedCell = null;
  }
}

function isCurrentPlayerPiece(piece) {
  return (currentPlayer === 'white' && isWhitePiece(piece)) ||
         (currentPlayer === 'black' && !isWhitePiece(piece));
}



function drawBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      let isLight = (row + col) % 2 === 0;
      fill(isLight ? '#f0d9b5' : '#b58863');
      rect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

function drawPieces() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      let piece = pieces[row][col];
      if (piece !== '') {
        // fill(isWhitePiece(piece) ? 0 : 255); // black for white piece, white for black piece
        fill(0);
        text(piece, col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
      }
    }
  }
}

function saveBoardState() {
  // Deep copy
  let snapshot = pieces.map(row => row.slice());
  moveHistory.push(snapshot);
}

function undoMove() {
  if (moveHistory.length > 0) {
    // console.log(pieces);
    pieces = moveHistory.pop();
    return true;
    // console.log(pieces);
  }
  return false;
}

function keyPressed() {
  if (key === 'u' || key === 'U') {
    
    if(undoMove())
      switchPlayer();
  }
}


function movePiece(fromRow, fromCol, toRow, toCol) {
  let piece = pieces[fromRow][fromCol];
  if (piece === '') return;

  if (isLegalMove(piece, fromRow, fromCol, toRow, toCol)) {
    saveBoardState();
    pieces[toRow][toCol] = piece;
    pieces[fromRow][fromCol] = '';
    return true;
  } else {
    console.log("Illegal move!");
  }
}

// function attemptMove(fromRow, fromCol, toRow, toCol) {
//   let piece = pieces[fromRow][fromCol];
//   let target = pieces[toRow][toCol];

//   if (!piece || piece === '') return false;

//   // Prevent capturing your own piece
//   if (target && target !== '' && isCurrentPlayerPiece(target)) return false;

//   // (Optional: Add full move validation here)

//   saveBoardState();
//   pieces[toRow][toCol] = piece;
//   pieces[fromRow][fromCol] = '';
//   return true;
// }


function switchPlayer() {
  currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
}


function isLegalMove(piece, fromRow, fromCol, toRow, toCol) {
  let dr = toRow - fromRow;
  let dc = toCol - fromCol;
  let absDr = Math.abs(dr);
  let absDc = Math.abs(dc);
  let target = pieces[toRow][toCol];

  let isWhite = /♙|♖|♘|♗|♕|♔/.test(piece);
  let isTargetSameSide = target !== '' && (/♙|♖|♘|♗|♕|♔/.test(target) === isWhite);
  if (isTargetSameSide) return false;

  switch (piece) {
    case '♙': // White pawn
      if (dc === 0 && dr === -1 && target === '') return true; // move forward
      if (dc === 0 && fromRow === 6 && dr === -2 && target === '' && pieces[5][fromCol] === '') return true; // double move
      if (absDc === 1 && dr === -1 && target !== '') return true; // capture
      break;
    case '♟': // Black pawn
      if (dc === 0 && dr === 1 && target === '') return true;
      if (dc === 0 && fromRow === 1 && dr === 2 && target === '' && pieces[2][fromCol] === '') return true;
      if (absDc === 1 && dr === 1 && target !== '') return true;
      break;
    case '♖': case '♜': // Rook
      if (dr === 0 || dc === 0) return clearPath(fromRow, fromCol, toRow, toCol);
      break;
    case '♘': case '♞': // Knight
      if ((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2)) return true;
      break;
    case '♗': case '♝': // Bishop
      if (absDr === absDc) return clearPath(fromRow, fromCol, toRow, toCol);
      break;
    case '♕': case '♛': // Queen
      if ((absDr === absDc) || (dr === 0 || dc === 0)) return clearPath(fromRow, fromCol, toRow, toCol);
      break;
    case '♔': case '♚': // King
      if (absDr <= 1 && absDc <= 1) return true;
      break;
  }

  return false;
}

// ✅ Helper: check path is clear for sliding pieces (bishop, rook, queen)
function clearPath(fromRow, fromCol, toRow, toCol) {
  let stepR = Math.sign(toRow - fromRow);
  let stepC = Math.sign(toCol - fromCol);
  let r = fromRow + stepR;
  let c = fromCol + stepC;
  while (r !== toRow || c !== toCol) {
    if (pieces[r][c] !== '') return false;
    r += stepR;
    c += stepC;
  }
  return true;
}
