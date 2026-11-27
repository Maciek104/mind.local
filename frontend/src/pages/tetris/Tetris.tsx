import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import Nav from '../../components/Nav/Nav.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import sportsEsportsIcon from '../../assets/icons/sports_esports.svg';
import quizIcon from '../../assets/icons/quiz.svg';
import replayIcon from '../../assets/icons/replay.svg';
import './Tetris.css';

const WIDTH = 10;
const HEIGHT = 20;
const FIREWORK_COLORS = [
  '#facc15',
  '#fb7185',
  '#67e8f9',
  '#c084fc',
  '#4ade80',
  '#fdba74',
];
const FIREWORK_PARTICLE_COUNT = 1536;

type Cell = string | null;
type Board = Cell[][];
type Piece = {
  shape: number[][];
  color: string;
  x: number;
  y: number;
};
type Game = {
  board: Board;
  piece: Piece | null;
  running: boolean;
  paused: boolean;
  over: boolean;
  score: number;
  lines: number;
  level: number;
};
type Firework = {
  id: number;
  x: number;
  y: number;
  textShadow: string;
  particles: Array<{ x: number; y: number; color: string; delay: number }>;
};
const SHAPES = [
  { shape: [[1, 1, 1, 1]], color: '#67e8f9' },
  { shape: [[1, 1], [1, 1]], color: '#facc15' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#c084fc' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#fb923c' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#60a5fa' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#4ade80' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
];

function emptyBoard(): Board {
  return Array.from({ length: HEIGHT }, () => Array<Cell>(WIDTH).fill(null));
}

function newPiece(): Piece {
  const { shape, color } = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const isLinePiece = shape.length === 1 && shape[0].length === 4;
  const pieceShape = isLinePiece && Math.random() < 0.5
    ? [[1], [1], [1], [1]]
    : shape;
  return {
    shape: pieceShape,
    color,
    x: Math.floor((WIDTH - pieceShape[0].length) / 2),
    y: 0,
  };
}

function createGame(): Game {
  return {
    board: emptyBoard(),
    piece: newPiece(),
    running: true,
    paused: false,
    over: false,
    score: 0,
    lines: 0,
    level: 1,
  };
}

function collides(board: Board, piece: Piece): boolean {
  return piece.shape.some((row, rowIndex) =>
    row.some((cell, columnIndex) => {
      if (!cell) return false;
      const x = piece.x + columnIndex;
      const y = piece.y + rowIndex;
      return (
        x < 0 ||
        x >= WIDTH ||
        y >= HEIGHT ||
        (y >= 0 && board[y][x] !== null)
      );
    }),
  );
}

function lockPiece(game: Game): Game {
  if (!game.piece) return game;

  const board = game.board.map((row) => [...row]);
  game.piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const x = game.piece!.x + columnIndex;
      const y = game.piece!.y + rowIndex;
      if (cell && y >= 0) board[y][x] = game.piece!.color;
    });
  });

  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const cleared = HEIGHT - remainingRows.length;
  while (remainingRows.length < HEIGHT) {
    remainingRows.unshift(Array<Cell>(WIDTH).fill(null));
  }

  const lines = game.lines + cleared;
  const piece = newPiece();
  const nextGame: Game = {
    ...game,
    board: remainingRows,
    piece,
    lines,
    level: Math.floor(lines / 10) + 1,
    score: game.score + [0, 100, 300, 500, 800][cleared] * game.level,
  };

  if (collides(remainingRows, piece)) {
    return { ...nextGame, piece: null, over: true, running: false };
  }

  return nextGame;
}

function advance(game: Game, hardDrop = false): Game {
  if (!game.running || game.paused || game.over || !game.piece) return game;

  if (hardDrop) {
    let piece = game.piece;
    while (!collides(game.board, { ...piece, y: piece.y + 1 })) {
      piece = { ...piece, y: piece.y + 1 };
    }
    return lockPiece({
      ...game,
      piece,
      score: game.score + (piece.y - game.piece.y) * 2,
    });
  }

  const nextPiece = { ...game.piece, y: game.piece.y + 1 };
  return collides(game.board, nextPiece)
    ? lockPiece(game)
    : { ...game, piece: nextPiece };
}

function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, columnIndex) =>
    shape.map((row) => row[columnIndex]).reverse(),
  );
}

function handleKey(game: Game, key: string): Game {
  if (key.toLowerCase() === 'r') return createGame();
  if (key.toLowerCase() === 'p' && game.running) {
    return { ...game, paused: !game.paused };
  }
  if (!game.running || game.paused || game.over || !game.piece) return game;

  if (key === ' ' || key === 'ArrowUp' || key.toLowerCase() === 'x') {
    if (key === ' ') return advance(game, true);
    const rotated = { ...game.piece, shape: rotate(game.piece.shape) };
    return collides(game.board, rotated) ? game : { ...game, piece: rotated };
  }

  const dx = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
  if (dx) {
    const moved = { ...game.piece, x: game.piece.x + dx };
    return collides(game.board, moved) ? game : { ...game, piece: moved };
  }

  if (key === 'ArrowDown') return advance(game);
  return game;
}

function Tetris() {
  const [game, setGame] = useState(createGame);
  const [firework, setFirework] = useState<Firework | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGame((current) => advance(current));
    }, Math.max(100, 700 - (game.level - 1) * 55));
    return () => window.clearInterval(interval);
  }, [game.level]);

  useEffect(() => {
    let id = 0;
    let appearanceTimeout = 0;
    let removalTimeout = 0;

    function scheduleFirework() {
      appearanceTimeout = window.setTimeout(() => {
        const nextId = ++id;
        const colorIndex = Math.floor(Math.random() * FIREWORK_COLORS.length);
        const otherColor = (
          colorIndex +
          1 +
          Math.floor(Math.random() * (FIREWORK_COLORS.length - 1))
        ) % FIREWORK_COLORS.length;
        const textShadow = `0 0 4px white, 0 0 14px ${FIREWORK_COLORS[colorIndex]}, 0 0 34px ${FIREWORK_COLORS[otherColor]}, 0 0 58px ${FIREWORK_COLORS[colorIndex]}`;
        const particles = Array.from(
          { length: FIREWORK_PARTICLE_COUNT },
          () => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 48 + Math.sqrt(Math.random()) * 150;

            return {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              color: FIREWORK_COLORS[
                Math.floor(Math.random() * FIREWORK_COLORS.length)
              ],
              delay: Math.floor(Math.random() * 180),
            };
          },
        );
        setFirework({
          id: nextId,
          x: 12 + Math.random() * 76,
          y: 12 + Math.random() * 76,
          textShadow,
          particles,
        });
        removalTimeout = window.setTimeout(() => {
          setFirework((current) => current?.id === nextId ? null : current);
        }, 2800);
        scheduleFirework();
      }, 3750);
    }

    appearanceTimeout = window.setTimeout(scheduleFirework, 1750);
    return () => {
      window.clearTimeout(appearanceTimeout);
      window.clearTimeout(removalTimeout);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(
          event.key,
        )
      ) {
        event.preventDefault();
      }
      setGame((current) => handleKey(current, event.key));
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const cells = game.board.map((row) => [...row]);
  if (game.piece) {
    game.piece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const x = game.piece!.x + columnIndex;
        const y = game.piece!.y + rowIndex;
        if (cell && y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
          cells[y][x] = game.piece!.color;
        }
      });
    });
  }

  return (
    <div className="tetris-page">
      <Nav page="TETRIS" />
      <main className="tetris-main">
        <section className="tetris-content" aria-label="Tetris game">
          <div className="tetris-game">
            <aside className="tetris-sidebar">
              <section className="tetris-panel">
                <div className="tetris-panel-title">
                  <img src={sportsEsportsIcon} alt="" />
                  <h2>SCORE</h2>
                </div>
                <div className="tetris-panel-body tetris-stats">
                  <div><span>Score</span><strong>{game.score}</strong></div>
                  <div><span>Lines cleared</span><strong>{game.lines}</strong></div>
                  <div><span>Level</span><strong>{game.level}</strong></div>
                </div>
              </section>

              <section className="tetris-panel">
                <div className="tetris-panel-title">
                  <img src={quizIcon} alt="" />
                  <h2>HOW TO PLAY</h2>
                </div>
                <div className="tetris-panel-body tetris-controls">
                  <p><kbd>←</kbd> <kbd>→</kbd><span>Move</span></p>
                  <p><kbd>↓</kbd><span>Soft drop</span></p>
                  <p><kbd>↑</kbd><span>Rotate piece</span></p>
                  <p><kbd>Space</kbd><span>Hard drop</span></p>
                  <p><kbd>P</kbd><span>Pause</span></p>
                </div>
              </section>

              <section className="tetris-panel tetris-restart-panel">
                <div className="tetris-panel-title">
                  <img src={replayIcon} alt="" />
                  <h2>NEW GAME</h2>
                </div>
                <div className="tetris-panel-body">
                  <p>Ready to give it another try?</p>
                  <button
                    className="tetris-restart"
                    type="button"
                    onClick={() => setGame(createGame())}
                  >
                    Start a new game
                  </button>
                  <span className="tetris-restart-hint">Or press R to restart</span>
                </div>
              </section>
              <p className="tetris-cheer">Good luck! ✨</p>
            </aside>

            <div className="tetris-board-wrap">
              <div
                className="tetris-board"
                role="img"
                aria-label={`Tetris board, ${game.score} points`}
              >
                {cells.flatMap((row, rowIndex) =>
                  row.map((color, columnIndex) => (
                    <div
                      className={`tetris-cell${color ? ' filled' : ''}`}
                      key={`${rowIndex}-${columnIndex}`}
                      style={color ? { '--cell-color': color } as CSSProperties : undefined}
                    />
                  )),
                )}
              </div>
              {(game.paused || game.over) && (
                <div className="tetris-overlay">
                  <strong>{game.over ? 'Game over' : 'Paused'}</strong>
                  {game.over && (
                    <button type="button" onClick={() => setGame(createGame())}>
                      <img src={replayIcon} alt="" />
                      Play again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {firework && (
        <div className="tetris-fireworks" aria-hidden="true">
          <div
            className="tetris-firework"
            key={firework.id}
            style={{ left: `${firework.x}%`, top: `${firework.y}%` }}
          >
            {firework.particles.map((particle, index) => (
              <i
                className="tetris-spark"
                key={index}
                style={{
                  '--spark-x': `${particle.x}px`,
                  '--spark-y': `${particle.y}px`,
                  '--spark-color': particle.color,
                  '--spark-delay': `${particle.delay}ms`,
                } as CSSProperties}
              />
            ))}
            <span
              className="tetris-firework-text"
              style={{ textShadow: firework.textShadow }}
            >
              WSZYSTKIE RYŚKI TO FAJNE CHŁOPAKI
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tetris;
