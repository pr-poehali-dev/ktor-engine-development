import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import CTORBoard from '@/components/CTORBoard';
import CTORControls from '@/components/CTORControls';
import {
  initGame,
  placePiece,
  movePiece,
  selectPiece,
  deselectPiece,
  getBestMove,
  getValidMoves,
  endTurn,
  GameState,
  Position,
} from '@/lib/ctor-game';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [vsComputer, setVsComputer] = useState(true);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Добро пожаловать в CTOR!',
      description: 'CTOR — стратегическая игра на доске 10×10, где цель — захватить больше клеток, чем противник.',
    },
    {
      title: 'Размещение фишек',
      description: 'За один ход вы можете поставить до 2 фишек на пустые клетки. Просто кликните на свободное место.',
    },
    {
      title: 'Перемещение фишек',
      description: 'Вы можете переместить одиночную фишку (без соседей) на 1 клетку по вертикали или горизонтали. Кликните на свою одиночную фишку, затем на соседнюю пустую клетку.',
    },
    {
      title: 'Захват фишек',
      description: 'Если фишка противника окружена 5-8 вашими фишками в области 3×3, она переворачивается и становится вашей!',
    },
    {
      title: 'Победа',
      description: 'Игра заканчивается, когда доска заполнена. Побеждает тот, у кого больше фишек на доске.',
    },
  ];

  useEffect(() => {
    if (
      vsComputer &&
      !gameState.gameOver &&
      gameState.currentPlayer === 'white' &&
      !tutorialMode &&
      gameState.actionsRemaining > 0
    ) {
      const timer = setTimeout(() => {
        const aiAction = getBestMove(gameState);
        if (aiAction) {
          if (aiAction.type === 'place') {
            setGameState(placePiece(gameState, aiAction.to));
          } else if (aiAction.type === 'move' && aiAction.from) {
            setGameState(movePiece(gameState, aiAction.from, aiAction.to));
          }
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState, vsComputer, tutorialMode]);

  const handleCellClick = (pos: Position) => {
    if (gameState.gameOver || (vsComputer && gameState.currentPlayer === 'white')) {
      return;
    }

    if (gameState.selectedPiece) {
      const validMoves = getValidMoves(gameState.board, gameState.selectedPiece, gameState.currentPlayer);
      const isValidMove = validMoves.some(m => m.row === pos.row && m.col === pos.col);
      
      if (isValidMove) {
        setGameState(movePiece(gameState, gameState.selectedPiece, pos));
      } else if (gameState.board[pos.row][pos.col] === gameState.currentPlayer) {
        setGameState(selectPiece(gameState, pos));
      } else {
        setGameState(deselectPiece(gameState));
      }
    } else {
      if (gameState.board[pos.row][pos.col] === null) {
        setGameState(placePiece(gameState, pos));
      } else if (gameState.board[pos.row][pos.col] === gameState.currentPlayer) {
        setGameState(selectPiece(gameState, pos));
      }
    }
  };

  const handleNewGame = () => {
    setGameState(initGame());
    setTutorialMode(false);
    setTutorialStep(0);
  };

  const handleEndTurn = () => {
    setGameState(endTurn(gameState));
  };

  const startTutorial = () => {
    setGameState(initGame());
    setTutorialMode(true);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialMode(false);
      setTutorialStep(0);
    }
  };

  const validMoves = gameState.selectedPiece 
    ? getValidMoves(gameState.board, gameState.selectedPiece, gameState.currentPlayer)
    : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-primary">CTOR</h1>
          <p className="text-lg text-muted-foreground">
            Стратегическая игра захвата территории
          </p>
        </header>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="game" className="gap-2">
              <Icon name="Gamepad2" size={18} />
              Игра
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Icon name="BookOpen" size={18} />
              Правила
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="gap-2">
              <Icon name="GraduationCap" size={18} />
              Обучение
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="animate-fade-in">
            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start justify-items-center">
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={vsComputer ? 'default' : 'outline'}
                    onClick={() => {
                      setVsComputer(true);
                      handleNewGame();
                    }}
                  >
                    <Icon name="Bot" size={18} />
                    Против ИИ
                  </Button>
                  <Button
                    variant={!vsComputer ? 'default' : 'outline'}
                    onClick={() => {
                      setVsComputer(false);
                      handleNewGame();
                    }}
                  >
                    <Icon name="Users" size={18} />
                    Для двоих
                  </Button>
                </div>

                <CTORBoard
                  board={gameState.board}
                  onCellClick={handleCellClick}
                  selectedPiece={gameState.selectedPiece}
                  validMoves={validMoves}
                  currentPlayer={gameState.currentPlayer}
                />

                {tutorialMode && (
                  <Card className="max-w-md mx-auto animate-fade-in border-accent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Шаг {tutorialStep + 1}/{tutorialSteps.length}</Badge>
                        <Icon name="Lightbulb" className="text-accent" size={24} />
                      </div>
                      <CardTitle>{tutorialSteps[tutorialStep].title}</CardTitle>
                      <CardDescription>{tutorialSteps[tutorialStep].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={nextTutorialStep} className="w-full">
                        {tutorialStep < tutorialSteps.length - 1 ? 'Далее' : 'Начать играть'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <CTORControls
                currentPlayer={gameState.currentPlayer}
                blackCount={gameState.blackCount}
                whiteCount={gameState.whiteCount}
                actionsRemaining={gameState.actionsRemaining}
                onNewGame={handleNewGame}
                onEndTurn={handleEndTurn}
                gameOver={gameState.gameOver}
                winner={gameState.winner}
                selectedPiece={gameState.selectedPiece}
              />
            </div>
          </TabsContent>

          <TabsContent value="rules" className="animate-fade-in">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={28} />
                  Правила игры CTOR
                </CardTitle>
                <CardDescription>
                  Стратегия окружения и захвата территории
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Target" size={20} className="text-accent" />
                      Цель игры
                    </h3>
                    <p className="text-muted-foreground">
                      Захватить больше клеток на доске, чем ваш противник. Игра заканчивается, когда все 121 клетка заполнены.
                      Побеждает игрок с наибольшим количеством фишек своего цвета.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Grid3x3" size={20} className="text-accent" />
                      Доска
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Игра ведётся на квадратной доске размером 11×11 клеток (всего 121 клетка).
                      Игроки используют фишки двух цветов: чёрные и белые.
                    </p>
                    <div className="bg-accent/10 p-4 rounded-lg border border-accent">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Icon name="Orbit" size={16} />
                        Тороидальная топология (ТОР):
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Доска устроена как поверхность тора (бублика) — верхний край соединён с нижним, 
                        левый с правым. Фишки могут перемещаться и захватывать через границы поля.
                        Цветные края показывают, какие стороны соединены между собой.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Play" size={20} className="text-accent" />
                      Ход игрока
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      За один ход игрок может совершить <strong>до 2 действий</strong> на выбор:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <Icon name="Circle" size={20} className="text-accent" />
                        <span><strong>Поставить фишку</strong> — разместить свою фишку на любую пустую клетку доски</span>
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Move" size={20} className="text-accent" />
                        <span><strong>Переместить фишку</strong> — переместить свою фишку на одну пустую клетку по вертикали или горизонтали (если рядом есть свободное место)</span>
                      </li>
                    </ul>
                    <div className="bg-muted/50 p-4 rounded-lg mt-3">
                      <p className="text-sm font-semibold mb-1">Примеры:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Поставить 2 фишки</li>
                        <li>• Поставить 1 фишку и переместить 1 фишку</li>
                        <li>• Переместить 2 одиночные фишки</li>
                        <li>• Совершить только 1 действие и завершить ход</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Zap" size={20} className="text-accent" />
                      Захват фишек противника
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Когда вы ставите или перемещаете фишку, проверяется окружение всех фишек противника в области 3×3 вокруг вашей фишки.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      <strong>Фишка противника переворачивается и становится вашей</strong>, если в области 3×3 вокруг неё находится <strong>от 5 до 8 ваших фишек</strong>.
                    </p>
                    <div className="bg-accent/10 p-4 rounded-lg border border-accent">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Icon name="Lightbulb" size={16} />
                        Важно:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Захват может произойти <strong>сразу у нескольких фишек</strong> противника в области 3×3 от вашей фишки.
                        Это делает каждый ход стратегически важным!
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Flag" size={20} className="text-accent" />
                      Окончание игры
                    </h3>
                    <p className="text-muted-foreground">
                      Игра автоматически заканчивается, когда <strong>все 100 клеток доски заполнены фишками</strong>.
                      Подсчитываются фишки каждого цвета, и объявляется победитель.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Trophy" size={20} className="text-accent" />
                      Определение победителя
                    </h3>
                    <p className="text-muted-foreground">
                      Побеждает игрок, у которого больше фишек своего цвета на доске в конце игры.
                      При равном количестве фишек объявляется ничья.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorial" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="GraduationCap" size={28} />
                    Режим обучения
                  </CardTitle>
                  <CardDescription>
                    Научитесь играть в CTOR шаг за шагом
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-2 hover:border-accent transition-colors cursor-pointer" onClick={startTutorial}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-accent/10">
                            <Icon name="PlayCircle" size={32} className="text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Начать обучение</CardTitle>
                            <CardDescription>Интерактивный урок</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Icon name="Brain" size={32} className="text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Советы новичкам</CardTitle>
                            <CardDescription>Базовые стратегии</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-semibold">Основные стратегии</h3>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Создавайте плотные группы</p>
                          <p className="text-sm text-muted-foreground">
                            Размещайте фишки рядом друг с другом, чтобы создать зоны влияния 3×3 для захвата фишек противника.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Защищайте свои фишки</p>
                          <p className="text-sm text-muted-foreground">
                            Следите, чтобы ваши фишки не оказывались в окружении 5-8 фишек противника.
                            Используйте перемещения, чтобы вывести фишки из опасных зон.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Используйте перемещения</p>
                          <p className="text-sm text-muted-foreground">
                            Любую фишку можно переместить на 1 клетку, если рядом есть свободное место.
                            Это позволяет создавать ловушки или спасаться от захвата.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Используйте тороидальность</p>
                          <p className="text-sm text-muted-foreground">
                            Благодаря тору все позиции равноценны — нет углов и краёв.
                            Захваты работают через границы, что открывает уникальные тактики.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Планируйте на 2 действия</p>
                          <p className="text-sm text-muted-foreground">
                            У вас есть 2 действия за ход — используйте их комбинированно.
                            Например: поставьте фишку для атаки, затем переместите другую для защиты.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;