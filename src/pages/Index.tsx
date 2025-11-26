import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import {
  initGame,
  makeMove,
  endGame,
  getBestMove,
  GameState,
  Position,
} from '@/lib/ktor-game';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [vsComputer, setVsComputer] = useState(true);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Добро пожаловать в КТОР!',
      description: 'КТОР — это упрощённая версия игры Го на доске 9×9.',
      highlightedMoves: [],
    },
    {
      title: 'Цель игры',
      description: 'Захватывайте территорию и камни противника. Побеждает тот, у кого больше очков.',
      highlightedMoves: [],
    },
    {
      title: 'Как ходить',
      description: 'Нажмите на любую свободную клетку, чтобы поставить камень. Попробуйте сделать ход здесь:',
      highlightedMoves: [{ row: 4, col: 4 }],
    },
    {
      title: 'Захват камней',
      description: 'Окружите камни противника со всех 4 сторон, чтобы захватить их и получить очки.',
      highlightedMoves: [],
    },
  ];

  useEffect(() => {
    if (
      vsComputer &&
      !gameState.gameOver &&
      gameState.currentPlayer === 'white' &&
      !tutorialMode
    ) {
      const timer = setTimeout(() => {
        const aiMove = getBestMove(gameState.board, 'white');
        if (aiMove) {
          handleMove(aiMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, vsComputer, tutorialMode]);

  const handleMove = (pos: Position) => {
    if (tutorialMode && tutorialStep === 2) {
      if (pos.row === 4 && pos.col === 4) {
        setTutorialStep(3);
      }
    }
    
    const newState = makeMove(gameState, pos);
    setGameState(newState);
  };

  const handleNewGame = () => {
    setGameState(initGame());
    setTutorialMode(false);
    setTutorialStep(0);
  };

  const handleEndGame = () => {
    setGameState(endGame(gameState));
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-primary">КТОР</h1>
          <p className="text-lg text-muted-foreground">
            Стратегическая игра в стиле Го
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

                <GameBoard
                  board={gameState.board}
                  onCellClick={handleMove}
                  tutorialMode={tutorialMode}
                  highlightedMoves={tutorialMode ? tutorialSteps[tutorialStep].highlightedMoves : []}
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

              <GameControls
                currentPlayer={gameState.currentPlayer}
                blackScore={gameState.blackScore}
                whiteScore={gameState.whiteScore}
                onNewGame={handleNewGame}
                onEndGame={handleEndGame}
                gameOver={gameState.gameOver}
                winner={gameState.winner}
              />
            </div>
          </TabsContent>

          <TabsContent value="rules" className="animate-fade-in">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={28} />
                  Правила игры КТОР
                </CardTitle>
                <CardDescription>
                  Простая и элегантная стратегическая игра
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
                      Захватить больше территории и камней противника, чем ваш оппонент.
                      В конце игры подсчитываются очки за захваченную территорию и камни.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Play" size={20} className="text-accent" />
                      Как играть
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <Icon name="Dot" size={20} />
                        Игроки ходят по очереди, размещая камни на пересечениях линий
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Dot" size={20} />
                        Первыми ходят чёрные камни
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Dot" size={20} />
                        Один раз поставленный камень не перемещается
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Zap" size={20} className="text-accent" />
                      Захват камней
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Группа камней захватывается, когда все соседние пункты по вертикали и горизонтали
                      заняты камнями противника. Захваченные камни снимаются с доски и приносят очки.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Важно:</p>
                      <p className="text-sm text-muted-foreground">
                        Свободные пункты рядом с группой камней называются «дыханиями».
                        Группа без дыханий захватывается противником.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Flag" size={20} className="text-accent" />
                      Окончание игры
                    </h3>
                    <p className="text-muted-foreground">
                      Игра заканчивается, когда оба игрока пасуют подряд или нажимают «Завершить игру».
                      Затем подсчитывается территория — пустые пункты, окружённые камнями одного цвета.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Trophy" size={20} className="text-accent" />
                      Подсчёт очков
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <Icon name="Plus" size={20} className="text-accent" />
                        1 очко за каждый захваченный камень противника
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Plus" size={20} className="text-accent" />
                        1 очко за каждый пункт контролируемой территории
                      </li>
                    </ul>
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
                    Научитесь играть в КТОР шаг за шагом
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
                          <p className="font-semibold mb-1">Контроль центра</p>
                          <p className="text-sm text-muted-foreground">
                            Камни в центре доски имеют больше возможностей для развития территории.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Связность групп</p>
                          <p className="text-sm text-muted-foreground">
                            Держите свои камни связанными, чтобы они поддерживали друг друга.
                            Изолированные камни легче захватить.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Следите за дыханиями</p>
                          <p className="text-sm text-muted-foreground">
                            Группа камней без свободных соседних пунктов будет захвачена.
                            Всегда оставляйте путь к отступлению.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                        <Icon name="Lightbulb" className="text-accent mt-1" size={24} />
                        <div>
                          <p className="font-semibold mb-1">Баланс атаки и защиты</p>
                          <p className="text-sm text-muted-foreground">
                            Не только атакуйте, но и защищайте свою территорию.
                            Одна сильная группа лучше нескольких слабых.
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
