import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CTORControlsProps {
  currentPlayer: 'black' | 'white' | null;
  blackCount: number;
  whiteCount: number;
  actionsRemaining: number;
  onNewGame: () => void;
  onEndTurn: () => void;
  gameOver: boolean;
  winner: 'black' | 'white' | null;
  selectedPiece: { row: number; col: number } | null;
}

const CTORControls = ({
  currentPlayer,
  blackCount,
  whiteCount,
  actionsRemaining,
  onNewGame,
  onEndTurn,
  gameOver,
  winner,
  selectedPiece,
}: CTORControlsProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="text-center mb-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {!gameOver && (
              <>
                Ходит: {currentPlayer === 'black' ? '⚫ Чёрные' : '⚪ Белые'}
              </>
            )}
            {gameOver && 'Игра окончена'}
          </Badge>
          {!gameOver && (
            <p className="text-sm text-muted-foreground mt-2">
              Действий осталось: <span className="font-bold text-accent">{actionsRemaining}</span>
            </p>
          )}
        </div>

        <div className="h-px bg-border" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center text-white font-bold">
              ⚫
            </div>
            <div>
              <p className="font-semibold">Чёрные</p>
              <p className="text-3xl font-bold">{blackCount}</p>
            </div>
          </div>
          {currentPlayer === 'black' && !gameOver && (
            <Icon name="Circle" className="text-accent animate-pulse" size={28} />
          )}
        </div>
        
        <div className="h-px bg-border" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center font-bold">
              ⚪
            </div>
            <div>
              <p className="font-semibold">Белые</p>
              <p className="text-3xl font-bold">{whiteCount}</p>
            </div>
          </div>
          {currentPlayer === 'white' && !gameOver && (
            <Icon name="Circle" className="text-accent animate-pulse" size={28} />
          )}
        </div>
      </Card>

      {selectedPiece && (
        <Card className="p-4 bg-accent/10 border-accent animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="Move" className="text-accent" size={20} />
            <p className="text-sm font-semibold">Выбрана фишка для перемещения</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Кликните на соседнюю клетку или выберите другую фишку
          </p>
        </Card>
      )}

      {gameOver && (
        <Card className="p-6 bg-accent/10 border-accent animate-fade-in">
          <div className="text-center space-y-3">
            <Icon name="Trophy" className="mx-auto text-accent" size={56} />
            <h3 className="text-2xl font-bold">
              {winner === 'black' && '⚫ Чёрные победили!'}
              {winner === 'white' && '⚪ Белые победили!'}
              {winner === null && 'Ничья!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Финальный счёт: {blackCount} - {whiteCount}
            </p>
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
        
        {!gameOver && actionsRemaining < 2 && (
          <Button
            onClick={onEndTurn}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Icon name="SkipForward" size={20} />
            Завершить ход ({actionsRemaining} действия осталось)
          </Button>
        )}
      </div>

      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="Info" size={18} />
          Подсказка
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Ставьте до 2 фишек за ход</li>
          <li>• Перемещайте одиночные фишки</li>
          <li>• Окружайте фишки противника (5-8 ваших в области 3×3)</li>
        </ul>
      </Card>
    </div>
  );
};

export default CTORControls;
