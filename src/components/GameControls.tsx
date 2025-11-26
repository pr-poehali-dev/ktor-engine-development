import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface GameControlsProps {
  currentPlayer: 'black' | 'white' | null;
  blackScore: number;
  whiteScore: number;
  onNewGame: () => void;
  onEndGame: () => void;
  gameOver: boolean;
  winner: 'black' | 'white' | null;
}

const GameControls = ({
  currentPlayer,
  blackScore,
  whiteScore,
  onNewGame,
  onEndGame,
  gameOver,
  winner,
}: GameControlsProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-700" />
            <div>
              <p className="font-semibold">Чёрные</p>
              <p className="text-2xl font-bold">{blackScore}</p>
            </div>
          </div>
          {currentPlayer === 'black' && !gameOver && (
            <Icon name="Circle" className="text-accent animate-pulse" size={24} />
          )}
        </div>
        
        <div className="h-px bg-border" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200" />
            <div>
              <p className="font-semibold">Белые</p>
              <p className="text-2xl font-bold">{whiteScore}</p>
            </div>
          </div>
          {currentPlayer === 'white' && !gameOver && (
            <Icon name="Circle" className="text-accent animate-pulse" size={24} />
          )}
        </div>
      </Card>

      {gameOver && (
        <Card className="p-6 bg-accent/10 border-accent animate-fade-in">
          <div className="text-center space-y-2">
            <Icon name="Trophy" className="mx-auto text-accent" size={48} />
            <h3 className="text-xl font-bold">
              {winner === 'black' && 'Чёрные победили!'}
              {winner === 'white' && 'Белые победили!'}
              {winner === null && 'Ничья!'}
            </h3>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <Button
          onClick={onNewGame}
          className="w-full"
          size="lg"
        >
          <Icon name="RotateCcw" size={20} />
          Новая игра
        </Button>
        
        {!gameOver && (
          <Button
            onClick={onEndGame}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Icon name="Flag" size={20} />
            Завершить игру
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
