import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Pause, Play, RefreshCcw, Volume2, VolumeX } from 'lucide-react';
import { Difficulty, GameState, Pipe, INITIAL_SPEED, SPEED_INCREMENT, MAX_SPEED, DIFFICULTY_SETTINGS } from './types';
import { assets, sounds } from './assets';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 52;

const initialState: GameState = {
  bird: {
    y: CANVAS_HEIGHT / 2,
    velocity: 0,
    rotation: 0,
  },
  pipes: [],
  score: 0,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  difficulty: 'normal',
  speed: INITIAL_SPEED,
  backgroundX: 0,
};

const FlappyBird: React.FC = () => {
  const [state, setState] = useState<GameState>(initialState);
  const [isMuted, setIsMuted] = useState(false);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPipeRef = useRef<number>(0);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Howler.mute(!isMuted);
  };

  const createPipe = (x: number): Pipe => {
    const gap = DIFFICULTY_SETTINGS[state.difficulty].pipeGap;
    const minHeight = 50;
    const maxHeight = CANVAS_HEIGHT - gap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    return {
      x,
      topHeight,
      bottomHeight: CANVAS_HEIGHT - topHeight - gap,
      width: PIPE_WIDTH,
      passed: false,
    };
  };

  const spawnPipe = useCallback(() => {
    const now = Date.now();
    if (now - lastPipeRef.current >= DIFFICULTY_SETTINGS[state.difficulty].spawnInterval) {
      setState(prev => ({
        ...prev,
        pipes: [...prev.pipes, createPipe(CANVAS_WIDTH)],
      }));
      lastPipeRef.current = now;
    }
  }, [state.difficulty]);

  const handleClick = () => {
    if (state.isGameOver) {
      resetGame();
      return;
    }

    if (!isMuted) sounds.flap.play();
    setState(prev => ({
      ...prev,
      bird: {
        ...prev.bird,
        velocity: FLAP_STRENGTH,
      },
    }));
  };

  const resetGame = () => {
    setState({
      ...initialState,
      highScore: state.highScore,
      difficulty: state.difficulty,
    });
    lastPipeRef.current = 0;
  };

  const togglePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const updateGame = useCallback(() => {
    setState(prev => {
      if (prev.isGameOver || prev.isPaused) return prev;

      // Update bird
      const newBird = {
        y: prev.bird.y + prev.bird.velocity,
        velocity: prev.bird.velocity + GRAVITY,
        rotation: prev.bird.velocity * 2,
      };

      // Update pipes
      const newPipes = prev.pipes
        .map(pipe => ({
          ...pipe,
          x: pipe.x - prev.speed,
        }))
        .filter(pipe => pipe.x + pipe.width > 0);

      // Update background
      const newBackgroundX = (prev.backgroundX - prev.speed) % assets.background.width;

      // Check collisions
      const birdBox = {
        top: newBird.y,
        bottom: newBird.y + BIRD_HEIGHT,
        left: 50,
        right: 50 + BIRD_WIDTH,
      };

      const hasCollision = newPipes.some(pipe => {
        return (
          birdBox.right > pipe.x &&
          birdBox.left < pipe.x + pipe.width &&
          (birdBox.top < pipe.topHeight || birdBox.bottom > CANVAS_HEIGHT - pipe.bottomHeight)
        );
      });

      // Check if bird hit the ground or ceiling
      const hitBoundary = newBird.y < 0 || newBird.y + BIRD_HEIGHT > CANVAS_HEIGHT;

      if (hasCollision || hitBoundary) {
        if (!isMuted) sounds.hit.play();
        return { ...prev, isGameOver: true };
      }

      // Update score
      let newScore = prev.score;
      newPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < 50) {
          if (!isMuted) sounds.score.play();
          pipe.passed = true;
          newScore++;
        }
      });

      // Update speed based on score
      const newSpeed = Math.min(
        INITIAL_SPEED + (newScore * SPEED_INCREMENT),
        MAX_SPEED
      );

      return {
        ...prev,
        bird: newBird,
        pipes: newPipes,
        score: newScore,
        highScore: Math.max(newScore, prev.highScore),
        speed: newSpeed,
        backgroundX: newBackgroundX,
      };
    });
  }, [isMuted]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Draw background
    const bgPattern = ctx.createPattern(assets.background, 'repeat-x');
    if (bgPattern) {
      ctx.fillStyle = bgPattern;
      ctx.save();
      ctx.translate(state.backgroundX, 0);
      ctx.fillRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT);
      ctx.restore();
    }

    // Draw pipes
    state.pipes.forEach(pipe => {
      // Top pipe
      ctx.drawImage(
        assets.pipeTop,
        pipe.x,
        pipe.topHeight - assets.pipeTop.height,
        pipe.width,
        assets.pipeTop.height
      );

      // Bottom pipe
      ctx.drawImage(
        assets.pipeBottom,
        pipe.x,
        CANVAS_HEIGHT - pipe.bottomHeight,
        pipe.width,
        assets.pipeBottom.height
      );
    });

    // Draw bird
    ctx.save();
    ctx.translate(50 + BIRD_WIDTH / 2, state.bird.y + BIRD_HEIGHT / 2);
    ctx.rotate((state.bird.rotation * Math.PI) / 180);
    ctx.drawImage(
      assets.bird,
      -BIRD_WIDTH / 2,
      -BIRD_HEIGHT / 2,
      BIRD_WIDTH,
      BIRD_HEIGHT
    );
    ctx.restore();

    // Draw score
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(state.score.toString(), CANVAS_WIDTH / 2, 50);
    ctx.fillText(state.score.toString(), CANVAS_WIDTH / 2, 50);
  }, [state]);

  useEffect(() => {
    if (state.isGameOver || state.isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      updateGame();
      drawGame();
      spawnPipe();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [state.isGameOver, state.isPaused, updateGame, drawGame, spawnPipe]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') handleClick();
    });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleClick);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-4">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(diff => (
            <motion.button
              key={diff}
              onClick={() => setState(prev => ({ ...prev, difficulty: diff }))}
              className={`px-4 py-2 rounded-lg capitalize transition-colors
                ${state.difficulty === diff
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {diff}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="text-lg font-semibold"
            initial={{ scale: 1 }}
            animate={{ scale: state.score > state.highScore ? [1, 1.2, 1] : 1 }}
          >
            Score: {state.score}
          </motion.div>
          <div className="text-lg font-semibold text-yellow-500">
            High Score: {state.highScore}
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button
            onClick={togglePause}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {state.isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw size={24} />
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-colors duration-300"
        />

        <AnimatePresence>
          {state.isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg backdrop-blur-sm"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Score: {state.score}</p>
                <motion.button
                  onClick={resetGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Click or press Space to flap</p>
        <p>Avoid the pipes and try to get the highest score!</p>
        <p>The game gets faster as your score increases</p>
      </div>
    </div>
  );
};

export default FlappyBird;