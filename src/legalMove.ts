export type Board = (string | null)[];

export function isLegalMove(pieceString: string, startIndex: number, targetIndex: number, board: Board): boolean {
  const piece = pieceString[1];
  let moveFunction;

  switch (piece) {
    case "p": moveFunction = isPawnLegalMove; break;
    case "r": moveFunction = isRookLegalMove; break;
    case "n": moveFunction = isKnightLegalMove; break;
    case "b": moveFunction = isBishopLegalMove; break;
    case "q": moveFunction = isQueenLegalMove; break;
    case "k": moveFunction = isKingLegalMove; break;
  }

  if (moveFunction) {
    return moveFunction(startIndex, targetIndex, pieceString, board);
  }
  return false;
}

function getPosition(index: number) {
  return {
    row: Math.floor(index / 8),
    col: index % 8,
  };
}

function isTargetAvailable(piece: string, targetIndex: number, board: Board): boolean {
  const targetPiece = board[targetIndex];
  return !targetPiece || targetPiece[0] !== piece[0];
}

function checkPath(startIndex: number, targetIndex: number, board: Board): boolean {
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

function isPawnLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = target.row - start.row;
  const colDiff = target.col - start.col;

  const isWhite = piece[0] === "w";
  const direction = isWhite ? -1 : 1;
  const startingRow = isWhite ? 6 : 1;

  if (colDiff === 0 && !board[targetIndex]) {
    const canMoveOne = rowDiff === direction;
    const canMoveTwo = rowDiff === direction * 2 && start.row === startingRow;

    if (canMoveOne || (canMoveTwo && !board[startIndex + direction * 8])) {
      return true;
    }
  }

  const targetPiece = board[targetIndex];
  const canCapture = targetPiece && targetPiece[0] !== piece[0];

  return Math.abs(colDiff) === 1 && rowDiff === direction && canCapture;
}

function isRookLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const movesStraight = start.row === target.row || start.col === target.col;

  return (
    movesStraight &&
    checkPath(startIndex, targetIndex, board) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isKnightLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return (
    ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isBishopLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const movesDiagonally = Math.abs(target.row - start.row) === Math.abs(target.col - start.col);

  return (
    movesDiagonally &&
    checkPath(startIndex, targetIndex, board) &&
    isTargetAvailable(piece, targetIndex, board)
  );
}

function isQueenLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  return (
    isRookLegalMove(startIndex, targetIndex, piece, board) ||
    isBishopLegalMove(startIndex, targetIndex, piece, board)
  );
}

function isKingLegalMove(startIndex: number, targetIndex: number, piece: string, board: Board): boolean {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return rowDiff <= 1 && colDiff <= 1 && isTargetAvailable(piece, targetIndex, board);
}

function findKing(color: string, board: Board): number | undefined {
  for (let x = 0; x < 64; x++) {
    if (board[x] && board[x]?.startsWith(`${color}k`)) {
      return x;
    }
  }
  return undefined;
}

export function isPlayerInCheck(color: string, board: Board): boolean {
  const kingIndex = findKing(color, board);
  if (kingIndex === undefined) return false;

  const enemyColor = color === "w" ? "b" : "w";

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece && piece.startsWith(enemyColor)) {
      if (isLegalMove(piece, i, kingIndex, board)) {
        return true;
      }
    }
  }

  return false;
}

export function isPlayerInCheckmate(color: string, board: Board): boolean {
  // A player can only be in checkmate if they are currently in check
  if (!isPlayerInCheck(color, board)) {
    return false;
  }

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (!piece || !piece.startsWith(color)) {
      continue;
    }

    for (let j = 0; j < 64; j++) {
      if (i === j) continue;

      // Check if the move is physically possible for the piece
      if (isLegalMove(piece, i, j, board)) {
        // Create a proper clone of the board array
        const boardClone = [...board]; 
        
        // Simulate the move on the clone
        if (boardClone) {
        boardClone[j] = boardClone[i];
        boardClone[i] = null;

        // If making this move results in the king no longer being in check, it's not checkmate
        if (!isPlayerInCheck(color, boardClone)) {
          return false;
          }
        }
      }
    }
  }

  return true;
}