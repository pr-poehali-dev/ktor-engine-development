export type Player = 'black' | 'white' | null;

export interface Position {
  row: number;
  col: number;
}

export type ActionType = 'place' | 'move';

export interface GameAction {
  type: ActionType;
  from?: Position;
  to: Position;
}

export interface GameState {
  board: Player[][];
  currentPlayer: Player;
  actionsRemaining: number;
  selectedPiece: Position | null;
  gameOver: boolean;
  winner: Player;
  blackCount: number;
  whiteCount: number;
}

const BOARD_SIZE = 10;

export const createEmptyBoard = (): Player[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

export const initGame = (): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  actionsRemaining: 2,
  selectedPiece: null,
  gameOver: false,
  winner: null,
  blackCount: 0,
  whiteCount: 0,
});

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
};

export const canPlacePiece = (board: Player[][], pos: Position): boolean => {
  return isValidPosition(pos) && board[pos.row][pos.col] === null;
};

export const canMovePiece = (board: Player[][], from: Position, to: Position, player: Player): boolean => {
  if (!isValidPosition(from) || !isValidPosition(to)) return false;
  if (board[from.row][from.col] !== player) return false;
  if (board[to.row][to.col] !== null) return false;
  
  const isIsolated = getNeighbors(from).every(n => board[n.row][n.col] !== player);
  if (!isIsolated) return false;
  
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

const getNeighbors = (pos: Position): Position[] => {
  const neighbors: Position[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  
  for (const dir of directions) {
    const newRow = pos.row + dir.row;
    const newCol = pos.col + dir.col;
    if (isValidPosition({ row: newRow, col: newCol })) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
};

const get3x3Area = (pos: Position): Position[] => {
  const area: Position[] = [];
  
  for (let row = pos.row - 1; row <= pos.row + 1; row++) {
    for (let col = pos.col - 1; col <= pos.col + 1; col++) {
      if (isValidPosition({ row, col })) {
        area.push({ row, col });
      }
    }
  }
  
  return area;
};

const checkAndFlipPieces = (board: Player[][], pos: Position, player: Player): number => {
  const opponent = player === 'black' ? 'white' : 'black';
  let flipped = 0;
  
  const area = get3x3Area(pos);
  const opponentPieces = area.filter(p => board[p.row][p.col] === opponent);
  
  for (const opponentPos of opponentPieces) {
    const surroundingArea = get3x3Area(opponentPos);
    const playerCount = surroundingArea.filter(p => board[p.row][p.col] === player).length;
    
    if (playerCount >= 5 && playerCount <= 8) {
      board[opponentPos.row][opponentPos.col] = player;
      flipped++;
    }
  }
  
  return flipped;
};

const countPieces = (board: Player[][]): { black: number; white: number } => {
  let black = 0;
  let white = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 'black') black++;
      if (board[row][col] === 'white') white++;
    }
  }
  
  return { black, white };
};

export const placePiece = (state: GameState, pos: Position): GameState => {
  if (!canPlacePiece(state.board, pos) || state.actionsRemaining === 0) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[pos.row][pos.col] = state.currentPlayer;
  
  checkAndFlipPieces(newBoard, pos, state.currentPlayer);
  
  const counts = countPieces(newBoard);
  const newActionsRemaining = state.actionsRemaining - 1;
  
  const isBoardFull = counts.black + counts.white === BOARD_SIZE * BOARD_SIZE;
  
  return {
    board: newBoard,
    currentPlayer: newActionsRemaining === 0 ? (state.currentPlayer === 'black' ? 'white' : 'black') : state.currentPlayer,
    actionsRemaining: newActionsRemaining === 0 ? 2 : newActionsRemaining,
    selectedPiece: null,
    gameOver: isBoardFull,
    winner: isBoardFull ? (counts.black > counts.white ? 'black' : counts.white > counts.black ? 'white' : null) : null,
    blackCount: counts.black,
    whiteCount: counts.white,
  };
};

export const movePiece = (state: GameState, from: Position, to: Position): GameState => {
  if (!canMovePiece(state.board, from, to, state.currentPlayer) || state.actionsRemaining === 0) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = state.currentPlayer;
  
  checkAndFlipPieces(newBoard, to, state.currentPlayer);
  
  const counts = countPieces(newBoard);
  const newActionsRemaining = state.actionsRemaining - 1;
  
  const isBoardFull = counts.black + counts.white === BOARD_SIZE * BOARD_SIZE;
  
  return {
    board: newBoard,
    currentPlayer: newActionsRemaining === 0 ? (state.currentPlayer === 'black' ? 'white' : 'black') : state.currentPlayer,
    actionsRemaining: newActionsRemaining === 0 ? 2 : newActionsRemaining,
    selectedPiece: null,
    gameOver: isBoardFull,
    winner: isBoardFull ? (counts.black > counts.white ? 'black' : counts.white > counts.black ? 'white' : null) : null,
    blackCount: counts.black,
    whiteCount: counts.white,
  };
};

export const selectPiece = (state: GameState, pos: Position): GameState => {
  if (state.board[pos.row][pos.col] !== state.currentPlayer) {
    return state;
  }
  
  const isIsolated = getNeighbors(pos).every(n => state.board[n.row][n.col] !== state.currentPlayer);
  if (!isIsolated) {
    return state;
  }
  
  return {
    ...state,
    selectedPiece: pos,
  };
};

export const deselectPiece = (state: GameState): GameState => {
  return {
    ...state,
    selectedPiece: null,
  };
};

export const getValidMoves = (board: Player[][], from: Position, player: Player): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  
  for (const dir of directions) {
    const to = { row: from.row + dir.row, col: from.col + dir.col };
    if (canMovePiece(board, from, to, player)) {
      moves.push(to);
    }
  }
  
  return moves;
};

export const getBestMove = (state: GameState): GameAction | null => {
  const player = state.currentPlayer;
  const opponent = player === 'black' ? 'white' : 'black';
  
  const possiblePlacements: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (canPlacePiece(state.board, { row, col })) {
        possiblePlacements.push({ row, col });
      }
    }
  }
  
  const possibleMoves: { from: Position; to: Position }[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const from = { row, col };
      if (state.board[row][col] === player) {
        const validMoves = getValidMoves(state.board, from, player);
        for (const to of validMoves) {
          possibleMoves.push({ from, to });
        }
      }
    }
  }
  
  let bestAction: GameAction | null = null;
  let bestScore = -Infinity;
  
  for (const pos of possiblePlacements) {
    const testBoard = state.board.map(row => [...row]);
    testBoard[pos.row][pos.col] = player;
    const flipped = checkAndFlipPieces(testBoard, pos, player);
    
    let score = flipped * 20;
    
    const area = get3x3Area(pos);
    const opponentInArea = area.filter(p => testBoard[p.row][p.col] === opponent).length;
    score += opponentInArea * 5;
    
    const centerDistance = Math.abs(pos.row - 4.5) + Math.abs(pos.col - 4.5);
    score += (9 - centerDistance) * 2;
    
    score += Math.random() * 5;
    
    if (score > bestScore) {
      bestScore = score;
      bestAction = { type: 'place', to: pos };
    }
  }
  
  for (const move of possibleMoves) {
    const testBoard = state.board.map(row => [...row]);
    testBoard[move.from.row][move.from.col] = null;
    testBoard[move.to.row][move.to.col] = player;
    const flipped = checkAndFlipPieces(testBoard, move.to, player);
    
    let score = flipped * 25 + 10;
    
    score += Math.random() * 5;
    
    if (score > bestScore) {
      bestScore = score;
      bestAction = { type: 'move', from: move.from, to: move.to };
    }
  }
  
  return bestAction;
};

export const endTurn = (state: GameState): GameState => {
  return {
    ...state,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
    actionsRemaining: 2,
    selectedPiece: null,
  };
};
