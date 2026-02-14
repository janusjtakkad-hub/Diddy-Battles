
import React, { useState, useCallback } from 'react';
import { WeaponType, GameState, BallState } from './types';
import { CHARACTERS, INITIAL_SPEED, ARENA_WIDTH, ARENA_HEIGHT, BALL_RADIUS } from './constants';
import CharacterSelector from './components/CharacterSelector';
import Arena from './components/Arena';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'selection',
    player1: null,
    player2: null,
    winner: null
  });

  const [p1Health, setP1Health] = useState(100);
  const [p2Health, setP2Health] = useState(100);

  const startGame = useCallback((char1: WeaponType, char2: WeaponType) => {
    const createBall = (id: 'player1' | 'player2', type: WeaponType, health: number, x: number, y: number, initialDir: number): BallState => {
      // Randomize velocity direction slightly while maintaining initial speed
      const angleOffset = (Math.random() - 0.5) * 1.5; // Random variance
      const vx = Math.cos(initialDir + angleOffset) * INITIAL_SPEED;
      const vy = Math.sin(initialDir + angleOffset) * INITIAL_SPEED;

      return {
        id,
        config: CHARACTERS[type],
        x,
        y,
        vx,
        vy,
        radius: BALL_RADIUS,
        health,
        maxHealth: health,
        weaponAngle: Math.random() * Math.PI * 2,
        weaponRotationSpeed: 0.12 + Math.random() * 0.04,
        lastHitTime: 0,
        currentDamageModifier: 1,
        hitCount: 0,
        trails: []
      };
    };

    setGameState({
      status: 'fighting',
      player1: createBall('player1', char1, p1Health, 180, ARENA_HEIGHT / 2, 0), // Moves Right
      player2: createBall('player2', char2, p2Health, ARENA_WIDTH - 180, ARENA_HEIGHT / 2, Math.PI), // Moves Left
      winner: null
    });
  }, [p1Health, p2Health]);

  const onGameOver = (winnerName: string) => {
    setGameState(prev => ({ ...prev, status: 'ended', winner: winnerName }));
  };

  const resetGame = () => {
    setGameState({
      status: 'selection',
      player1: null,
      player2: null,
      winner: null
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-8 px-4 bg-[#02040a] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.1)_0%,transparent_60%)] pointer-events-none" />
      
      <header className="mb-10 text-center shrink-0 z-10">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-500 to-slate-900 uppercase leading-none px-4">
          Battle Weapons by Irvin
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-[1px] w-16 bg-red-600/40" />
          <p className="text-slate-600 text-[10px] md:text-xs uppercase tracking-[0.5em] font-black">An Approved Version inspired by Earclacks</p>
          <div className="h-[1px] w-16 bg-blue-600/40" />
        </div>
      </header>

      <main className="w-full flex flex-col items-center justify-center flex-1 max-w-7xl z-10">
        {gameState.status === 'selection' && (
          <CharacterSelector 
            onStart={startGame} 
            p1Health={p1Health} 
            p2Health={p2Health} 
            setP1Health={setP1Health} 
            setP2Health={setP2Health} 
          />
        )}

        {gameState.status === 'fighting' && gameState.player1 && gameState.player2 && (
          <div className="animate-in fade-in duration-1000 w-full flex justify-center">
            <Arena 
              p1={gameState.player1} 
              p2={gameState.player2} 
              onGameOver={onGameOver} 
            />
          </div>
        )}

        {gameState.status === 'ended' && (
          <div className="text-center bg-[#07090f]/90 backdrop-blur-3xl p-16 md:p-24 rounded-[4rem] border-2 border-white/5 shadow-[0_0_150px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="text-red-600 text-xs font-black uppercase tracking-[0.8em] mb-6 animate-pulse">Irvin approved winner is...</div>
            <h2 className="text-6xl md:text-9xl font-black mb-12 uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-700 group-hover:to-white transition-all duration-1000">
              {gameState.winner}
            </h2>
            <button 
              onClick={resetGame}
              className="group relative px-16 py-6 bg-white text-black font-black text-2xl rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95 shadow-2xl uppercase italic tracking-tighter border-4 border-transparent hover:border-black/10"
            >
              <span className="relative z-10">Try Again But Without Checkpoints</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
            <div className="mt-12 flex justify-center gap-4">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-2 h-2 rounded-full bg-slate-800" />
               ))}
            </div>
          </div>
        )}
      </main>

      {/* Aesthetic Border Glows */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 opacity-50" />
    </div>
  );
};

export default App;
