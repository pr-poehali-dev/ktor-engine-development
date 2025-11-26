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

  const getBorderColor = (row: number, col: number) => {
    const isTopEdge = row === 0;
    const isBottomEdge = row === 9;
    const isLeftEdge = col === 0;
    const isRightEdge = col === 9;
    
    const isTopLeftCorner = isTopEdge && isLeftEdge;
    const isTopRightCorner = isTopEdge && isRightEdge;
    const isBottomLeftCorner = isBottomEdge && isLeftEdge;
    const isBottomRightCorner = isBottomEdge && isRightEdge;
    
    if (isTopLeftCorner || isBottomRightCorner) return 'bg-cyan-200/40';
    if (isTopRightCorner || isBottomLeftCorner) return 'bg-pink-200/40';
    
    if ((isTopEdge && col >= 1 && col <= 2) || (isBottomEdge && col >= 7 && col <= 8)) return 'bg-blue-300/40';
    if ((isTopEdge && col >= 7 && col <= 8) || (isBottomEdge && col >= 1 && col <= 2)) return 'bg-blue-200/40';
    
    if ((isTopEdge && col >= 3 && col <= 6) || (isBottomEdge && col >= 3 && col <= 6)) return 'bg-yellow-200/40';
    
    if ((isLeftEdge && row >= 1 && row <= 6) || (isRightEdge && row >= 1 && row <= 6)) return 'bg-orange-300/50';
    if ((isLeftEdge && row >= 7 && row <= 8) || (isRightEdge && row >= 7 && row <= 8)) return 'bg-pink-300/40';
    
    if (isLeftEdge || isRightEdge) return 'bg-green-200/40';
    
    return '';
  };

  return (
    <div className="inline-block p-6 rounded-lg shadow-2xl" style={{ backgroundColor: 'hsl(var(--board))' }}>
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(10, 1fr)` }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              className={`
                w-12 h-12 border border-gray-700/30 relative
                transition-all duration-200
                ${getBorderColor(rowIndex, colIndex)}
                ${cell === null ? 'hover:bg-green-100/20' : ''}
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