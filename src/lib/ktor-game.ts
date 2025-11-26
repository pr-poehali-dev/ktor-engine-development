export type Player = 'black' | 'white' | null;

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Player[][];
  currentPlayer: Player;
  blackScore: number;
  whiteScore: number;
  moveHistory: Position[];
  gameOver: boolean;
  winner: Player;
}

const BOARD_SIZE = 9;

export const createEmptyBoard = (): Player[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

export const initGame = (): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  blackScore: 0,
  whiteScore: 0,
  moveHistory: [],
  gameOver: false,
  winner: null,
});

export const isValidMove = (board: Player[][], pos: Position): boolean => {
  const { row, col } = pos;
  
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return false;
  }
  
  return board[row][col] === null;
};

const getNeighbors = (pos: Position): Position[] => {
  const { row, col } = pos;
  const neighbors: Position[] = [];
  
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  
  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;
    
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
};

const findGroup = (board: Player[][], pos: Position, player: Player): Position[] => {
  const group: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [pos];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (board[current.row][current.col] === player) {
      group.push(current);
      
      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        queue.push(neighbor);
      }
    }
  }
  
  return group;
};

const hasLiberties = (board: Player[][], group: Position[]): boolean => {
  for (const pos of group) {
    const neighbors = getNeighbors(pos);
    for (const neighbor of neighbors) {
      if (board[neighbor.row][neighbor.col] === null) {
        return true;
      }
    }
  }
  return false;
};

const removeGroup = (board: Player[][], group: Position[]): number => {
  for (const pos of group) {
    board[pos.row][pos.col] = null;
  }
  return group.length;
};

const captureStones = (board: Player[][], lastMove: Position, opponent: Player): number => {
  let captured = 0;
  const neighbors = getNeighbors(lastMove);
  
  for (const neighbor of neighbors) {
    if (board[neighbor.row][neighbor.col] === opponent) {
      const group = findGroup(board, neighbor, opponent);
      if (!hasLiberties(board, group)) {
        captured += removeGroup(board, group);
      }
    }
  }
  
  return captured;
};

export const makeMove = (state: GameState, pos: Position): GameState => {
  if (!isValidMove(state.board, pos) || state.gameOver) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[pos.row][pos.col] = state.currentPlayer;
  
  const opponent = state.currentPlayer === 'black' ? 'white' : 'black';
  const captured = captureStones(newBoard, pos, opponent);
  
  const newState: GameState = {
    board: newBoard,
    currentPlayer: opponent,
    blackScore: state.blackScore + (state.currentPlayer === 'black' ? captured : 0),
    whiteScore: state.whiteScore + (state.currentPlayer === 'white' ? captured : 0),
    moveHistory: [...state.moveHistory, pos],
    gameOver: false,
    winner: null,
  };
  
  return newState;
};

export const calculateTerritory = (board: Player[][]): { black: number; white: number } => {
  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = `${row},${col}`;
      if (visited.has(key) || board[row][col] !== null) continue;
      
      const territory: Position[] = [];
      const borderedBy = new Set<Player>();
      const queue: Position[] = [{ row, col }];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentKey = `${current.row},${current.col}`;
        
        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        
        if (board[current.row][current.col] === null) {
          territory.push(current);
          
          const neighbors = getNeighbors(current);
          for (const neighbor of neighbors) {
            queue.push(neighbor);
          }
        } else {
          borderedBy.add(board[current.row][current.col]);
        }
      }
      
      if (borderedBy.size === 1) {
        const owner = Array.from(borderedBy)[0];
        if (owner === 'black') blackTerritory += territory.length;
        if (owner === 'white') whiteTerritory += territory.length;
      }
    }
  }
  
  return { black: blackTerritory, white: whiteTerritory };
};

export const endGame = (state: GameState): GameState => {
  const territory = calculateTerritory(state.board);
  const blackTotal = state.blackScore + territory.black;
  const whiteTotal = state.whiteScore + territory.white;
  
  return {
    ...state,
    blackScore: blackTotal,
    whiteScore: whiteTotal,
    gameOver: true,
    winner: blackTotal > whiteTotal ? 'black' : whiteTotal > blackTotal ? 'white' : null,
  };
};

export const getBestMove = (board: Player[][], player: Player): Position | null => {
  const possibleMoves: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, { row, col })) {
        possibleMoves.push({ row, col });
      }
    }
  }
  
  if (possibleMoves.length === 0) return null;
  
  let bestMove: Position | null = null;
  let bestScore = -Infinity;
  
  for (const move of possibleMoves) {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = player;
    
    const opponent = player === 'black' ? 'white' : 'black';
    const captured = captureStones(testBoard, move, opponent);
    
    const selfGroup = findGroup(testBoard, move, player);
    const selfHasLiberties = hasLiberties(testBoard, selfGroup);
    
    let score = captured * 10;
    
    if (!selfHasLiberties) {
      score -= 100;
    } else {
      const libertyCount = selfGroup.reduce((count, pos) => {
        return count + getNeighbors(pos).filter(n => testBoard[n.row][n.col] === null).length;
      }, 0);
      score += libertyCount;
    }
    
    const neighbors = getNeighbors(move);
    for (const neighbor of neighbors) {
      if (testBoard[neighbor.row][neighbor.col] === opponent) {
        const opponentGroup = findGroup(testBoard, neighbor, opponent);
        if (!hasLiberties(testBoard, opponentGroup)) {
          score += opponentGroup.length * 15;
        }
      }
    }
    
    const centerDistance = Math.abs(move.row - 4) + Math.abs(move.col - 4);
    score += (8 - centerDistance) * 0.5;
    
    score += Math.random() * 3;
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
};
