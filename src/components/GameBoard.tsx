import { Player, Position } from '@/lib/ktor-game';

interface GameBoardProps {
  board: Player[][];
  onCellClick: (pos: Position) => void;
  highlightedMoves?: Position[];
  tutorialMode?: boolean;
}

const GameBoard = ({ board, onCellClick, highlightedMoves = [], tutorialMode = false }: GameBoardProps) => {
  const isHighlighted = (row: number, col: number) => {
    return highlightedMoves.some(pos => pos.row === row && pos.col === col);
  };

  return (
    <div className="inline-block p-6 rounded-lg shadow-2xl" style={{ backgroundColor: 'hsl(var(--board))' }}>
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(9, 1fr)` }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              className={`
                w-12 h-12 border border-gray-700/30 relative
                transition-all duration-200
                ${cell === null ? 'hover:bg-green-100/20' : ''}
                ${isHighlighted(rowIndex, colIndex) ? 'ring-2 ring-accent ring-offset-2' : ''}
              `}
              disabled={cell !== null && !tutorialMode}
            >
              {cell && (
                <div
                  className={`
                    absolute inset-1 rounded-full
                    animate-scale-in
                    shadow-lg
                    ${cell === 'black' 
                      ? 'bg-gray-900 border-2 border-gray-700' 
                      : 'bg-white border-2 border-gray-200'
                    }
                  `}
                />
              )}
              
              {cell === null && isHighlighted(rowIndex, colIndex) && tutorialMode && (
                <div className="absolute inset-1 rounded-full bg-accent/30 animate-pulse" />
              )}
              
              {(rowIndex === 2 || rowIndex === 6) && (colIndex === 2 || colIndex === 6) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-gray-700/50" />
                </div>
              )}
              {rowIndex === 4 && colIndex === 4 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-gray-700/50" />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
