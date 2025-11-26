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
  return true;
};

export const normalizePosition = (pos: Position): Position => {
  return {
    row: ((pos.row % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE,
    col: ((pos.col % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE,
  };
};

export const canPlacePiece = (board: Player[][], pos: Position): boolean => {
  const normalized = normalizePosition(pos);
  return board[normalized.row][normalized.col] === null;
};

export const canMovePiece = (board: Player[][], from: Position, to: Position, player: Player): boolean => {
  const normFrom = normalizePosition(from);
  const normTo = normalizePosition(to);
  
  if (board[normFrom.row][normFrom.col] !== player) return false;
  if (board[normTo.row][normTo.col] !== null) return false;
  
  const isIsolated = getNeighbors(from).every(n => {
    const nn = normalizePosition(n);
    return board[nn.row][nn.col] !== player;
  });
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
    neighbors.push({ row: pos.row + dir.row, col: pos.col + dir.col });
  }
  
  return neighbors;
};

const get3x3Area = (pos: Position): Position[] => {
  const area: Position[] = [];
  
  for (let row = pos.row - 1; row <= pos.row + 1; row++) {
    for (let col = pos.col - 1; col <= pos.col + 1; col++) {
      area.push({ row, col });
    }
  }
  
  return area;
};

const checkAndFlipPieces = (board: Player[][], pos: Position, player: Player): number => {
  const opponent = player === 'black' ? 'white' : 'black';
  let flipped = 0;
  
  const area = get3x3Area(pos);
  const opponentPieces = area.filter(p => {
    const np = normalizePosition(p);
    return board[np.row][np.col] === opponent;
  });
  
  for (const opponentPos of opponentPieces) {
    const surroundingArea = get3x3Area(opponentPos);
    const playerCount = surroundingArea.filter(p => {
      const np = normalizePosition(p);
      return board[np.row][np.col] === player;
    }).length;
    
    if (playerCount >= 5 && playerCount <= 8) {
      const normOpp = normalizePosition(opponentPos);
      board[normOpp.row][normOpp.col] = player;
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
  
  const normalized = normalizePosition(pos);
  const newBoard = state.board.map(row => [...row]);
  newBoard[normalized.row][normalized.col] = state.currentPlayer;
  
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
  
  const normFrom = normalizePosition(from);
  const normTo = normalizePosition(to);
  const newBoard = state.board.map(row => [...row]);
  newBoard[normFrom.row][normFrom.col] = null;
  newBoard[normTo.row][normTo.col] = state.currentPlayer;
  
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
  const normalized = normalizePosition(pos);
  if (state.board[normalized.row][normalized.col] !== state.currentPlayer) {
    return state;
  }
  
  const isIsolated = getNeighbors(pos).every(n => {
    const nn = normalizePosition(n);
    return state.board[nn.row][nn.col] !== state.currentPlayer;
  });
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
    const normalized = normalizePosition(pos);
    const testBoard = state.board.map(row => [...row]);
    testBoard[normalized.row][normalized.col] = player;
    const flipped = checkAndFlipPieces(testBoard, pos, player);
    
    let score = flipped * 20;
    
    const area = get3x3Area(pos);
    const opponentInArea = area.filter(p => {
      const np = normalizePosition(p);
      return testBoard[np.row][np.col] === opponent;
    }).length;
    score += opponentInArea * 5;
    

    
    score += Math.random() * 5;
    
    if (score > bestScore) {
      bestScore = score;
      bestAction = { type: 'place', to: pos };
    }
  }
  
  for (const move of possibleMoves) {
    const normFrom = normalizePosition(move.from);
    const normTo = normalizePosition(move.to);
    const testBoard = state.board.map(row => [...row]);
    testBoard[normFrom.row][normFrom.col] = null;
    testBoard[normTo.row][normTo.col] = player;
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