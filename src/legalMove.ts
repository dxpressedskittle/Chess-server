export function isLegalMove(pieceString: string, startIndex: number, targetIndex: number, board: Board) {
  const moveFunctions = {
    p: isPawnLegalMove,
    r: isRookLegalMove,
    n: isKnightLegalMove,
    b: isBishopLegalMove,
    q: isQueenLegalMove,
    k: isKingLegalMove,
  };

  const piece = pieceString[1];

  let moveFunction;

  switch(piece) {
    case "p":
        moveFunction = isPawnLegalMove; break;
    case "r":
        moveFunction = isRookLegalMove; break;
    case "n":
        moveFunction = isKnightLegalMove; break;
    case "b":
        moveFunction = isBishopLegalMove; break;
    case "q":
        moveFunction = isQueenLegalMove; break;
    case "k":
        moveFunction = isKingLegalMove; break;
  }

  if (moveFunction) {
    return moveFunction ? moveFunction(startIndex, targetIndex, pieceString, board) : false;
  }

   // sends out move function to set piece
}

function getPosition(index: number) {
  // calculates row and col from index
  return {
    row: Math.floor(index / 8),
    col: index % 8,
  };
}

function isTargetAvailable(piece: string, targetIndex: number, board: Board) {
  const targetPiece = board[targetIndex];
  return !targetPiece || targetPiece[0] !== piece[0];
}

function checkPath(startIndex: number, targetIndex: number, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = target.row - start.row;
  const colDiff = target.col - start.col;

  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  let currentRow = start.row + rowStep;
  let currentCol = start.col + colStep;

  while (currentRow !== target.row || currentCol !== target.col) {
    const currentIndex = currentRow * 8 + currentCol;
    if (board[currentIndex]) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
}


function isPawnLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const rowDiff = target.row - start.row;
  const colDiff = target.col - start.col;

  // White pieces move up (assuming index 0 is top-left, row 6 to 0)
  // Black pieces move down (row 1 to 7)
  // Adjust directions if your board orientation is inverted
  const isWhite = piece[0] === "w";
  const direction = isWhite ? -1 : 1; 
  const startingRow = isWhite ? 6 : 1;

  if (colDiff === 0 && !board[targetIndex]) {
    const canMoveOne = rowDiff === direction;
    const canMoveTwo = rowDiff === direction * 2 && start.row === startingRow;
    
    // Note: ensure direction * 8 matches your board indexing layout
    if (canMoveOne || (canMoveTwo && !board[startIndex + direction * 8])) {
      return true;
    }
  }

  const targetPiece = board[targetIndex];
  const canCapture = targetPiece && targetPiece[0] !== piece[0];
  return Math.abs(colDiff) === 1 && rowDiff === direction && canCapture;
}

function isRookLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const movesStraight = start.row === target.row || start.col === target.col;

  return (
    movesStraight &&
    checkPath(startIndex, targetIndex, board) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isKnightLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return (
    ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isBishopLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const movesDiagonally =
    Math.abs(target.row - start.row) === Math.abs(target.col - start.col);

  return (
    movesDiagonally &&
    checkPath(startIndex, targetIndex, board) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isQueenLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  return (
    isRookLegalMove(startIndex, targetIndex, piece, board) ||
    isBishopLegalMove(startIndex, targetIndex, piece, board)
  );
}

function isKingLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return rowDiff <= 1 && colDiff <= 1 && isTargetAvailable(piece, targetIndex, board);
}
