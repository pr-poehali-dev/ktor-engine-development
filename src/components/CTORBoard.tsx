import { Player, Position } from '@/lib/ctor-game';

interface CTORBoardProps {
  board: Player[][];
  onCellClick: (pos: Position) => void;
  selectedPiece: Position | null;
  validMoves?: Position[];
  currentPlayer: Player;
}

const CTORBoard = ({ board, onCellClick, selectedPiece, validMoves = [], currentPlayer }: CTORBoardProps) => {
  const isSelected = (row: number, col: number) => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(pos => pos.row === row && pos.col === col);
  };

  const getCellColor = (row: number, col: number) => {
    // Верхний ряд (row 0)
    if (row === 0) {
      if (col === 0) return 'bg-cyan-200/50';
      if (col === 1) return 'bg-pink-200/50';
      if (col >= 2 && col <= 5) return 'bg-yellow-200/50';
      if (col >= 6 && col <= 9) return 'bg-yellow-200/50';
      if (col === 10) return 'bg-cyan-200/50';
    }
    
    // Второй ряд (row 1)
    if (row === 1) {
      if (col === 0) return 'bg-pink-200/50';
      if (col === 1) return 'bg-blue-200/50';
      if (col === 2) return 'bg-blue-600/70';
      if (col >= 3 && col <= 7) return 'bg-blue-600/70';
      if (col === 8) return 'bg-blue-300/50';
      if (col === 9) return 'bg-blue-200/50';
      if (col === 10) return 'bg-pink-200/50';
    }
    
    // Ряды 2-7: боковые границы
    if (row >= 2 && row <= 7) {
      if (col === 0) return 'bg-orange-300/50';
      if (col === 1) return 'bg-green-300/50';
      if (col === 9) return 'bg-red-400/60';
      if (col === 10) return 'bg-green-300/50';
    }
    
    // Ряд 8
    if (row === 8) {
      if (col === 0) return 'bg-pink-300/50';
      if (col === 1) return 'bg-green-300/50';
      if (col === 9) return 'bg-red-400/60';
      if (col === 10) return 'bg-green-300/50';
    }
    
    // Ряд 9
    if (row === 9) {
      if (col === 0) return 'bg-cyan-200/50';
      if (col === 1) return 'bg-pink-300/50';
      if (col >= 2 && col <= 5) return 'bg-yellow-200/50';
      if (col >= 6 && col <= 8) return 'bg-yellow-200/50';
      if (col === 9) return 'bg-cyan-200/50';
      if (col === 10) return 'bg-pink-200/50';
    }
    
    // Ряд 10 (нижний)
    if (row === 10) {
      if (col === 0) return 'bg-pink-200/50';
      if (col === 1) return 'bg-blue-200/50';
      if (col >= 2 && col <= 5) return 'bg-blue-400/50';
      if (col >= 6 && col <= 8) return 'bg-blue-400/50';
      if (col === 9) return 'bg-pink-200/50';
      if (col === 10) return 'bg-blue-200/50';
    }
    
    // Внутренние клетки
    return 'bg-gray-50';
  };

  return (
    <div className="inline-block p-6 rounded-lg shadow-2xl" style={{ backgroundColor: 'hsl(var(--board))' }}>
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(11, 1fr)` }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              className={`
                w-12 h-12 border border-gray-700/30 relative
                transition-all duration-200
                ${getCellColor(rowIndex, colIndex)}
                ${cell === null ? 'hover:brightness-95' : ''}
                ${isSelected(rowIndex, colIndex) ? 'ring-4 ring-accent ring-offset-2 scale-105' : ''}
                ${isValidMove(rowIndex, colIndex) ? 'ring-2 ring-green-400' : ''}
              `}
            >
              {cell && (
                <div
                  className={`
                    absolute inset-1 rounded-full
                    animate-scale-in
                    shadow-lg
                    transition-all duration-200
                    ${cell === 'black' 
                      ? 'bg-gray-900 border-2 border-gray-700' 
                      : 'bg-white border-2 border-gray-200'
                    }
                    ${isSelected(rowIndex, colIndex) ? 'scale-90' : ''}
                  `}
                />
              )}
              
              {cell === null && isValidMove(rowIndex, colIndex) && (
                <div className="absolute inset-2 rounded-full bg-green-400/40 animate-pulse border-2 border-green-500" />
              )}
              
              {cell === null && !isValidMove(rowIndex, colIndex) && cell === null && (
                <div 
                  className={`
                    absolute inset-3 rounded-full transition-opacity duration-200
                    ${currentPlayer === 'black' ? 'bg-gray-900/20' : 'bg-white/40'}
                    opacity-0 group-hover:opacity-100
                  `}
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CTORBoard;