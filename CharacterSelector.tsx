
import React, { useState } from 'react';
import { WeaponType } from '../types';
import { CHARACTERS } from '../constants';
import { AudioEngine } from '../utils/AudioEngine';

interface Props {
  onStart: (p1: WeaponType, p2: WeaponType) => void;
  p1Health: number;
  p2Health: number;
  setP1Health: (v: number) => void;
  setP2Health: (v: number) => void;
}

const CharacterSelector: React.FC<Props> = ({ onStart, p1Health, p2Health, setP1Health, setP2Health }) => {
  const [p1, setP1] = useState<WeaponType>(WeaponType.NONE);
  const [p2, setP2] = useState<WeaponType>(WeaponType.SWORD);

  const handleP1Select = (type: WeaponType) => {
    setP1(type);
    AudioEngine.playUI();
  };

  const handleP2Select = (type: WeaponType) => {
    setP2(type);
    AudioEngine.playUI();
  };

  const handleStart = () => {
    // Crucial for mobile: Initialize/Resume audio context on user click
    AudioEngine.init();
    AudioEngine.playCrit(); // Dramatic start sound
    onStart(p1, p2);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl animate-in slide-in-from-bottom-10 duration-700 pb-20 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative group p-0.5 rounded-[3rem] bg-gradient-to-b from-red-500/20 to-transparent">
          <div className="relative flex flex-col gap-6 bg-[#07090f]/95 backdrop-blur-3xl p-10 rounded-[2.9rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-red-500 uppercase italic tracking-tighter leading-none">SIDE 67</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">MEME DUBBERS</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-black italic">B</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.values(CHARACTERS).map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleP1Select(char.id)}
                  className={`relative p-4 rounded-2xl text-left border-2 transition-all duration-300 group ${
                    p1 === char.id 
                      ? 'border-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.2)] scale-[1.02]' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: char.color, boxShadow: `0 0 15px ${char.color}` }} />
                    <span className="font-black text-[11px] text-white uppercase tracking-tight italic">{char.name}</span>
                  </div>
                  <p className="text-[9px] leading-tight text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter line-clamp-2">
                    {char.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Integrity Level</span>
                <span className="text-2xl font-black text-red-400 italic tracking-tighter tabular-nums">{p1Health}<span className="text-xs ml-1 opacity-50">HP</span></span>
              </div>
              <input 
                type="range" min="10" max="1000" value={p1Health} 
                onChange={(e) => setP1Health(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>
        </div>

        <div className="relative group p-0.5 rounded-[3rem] bg-gradient-to-b from-blue-500/20 to-transparent">
          <div className="relative flex flex-col gap-6 bg-[#07090f]/95 backdrop-blur-3xl p-10 rounded-[2.9rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-blue-500 uppercase italic tracking-tighter leading-none">SIDE 00</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">THE OVERLORDS</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black italic">A</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.values(CHARACTERS).map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleP2Select(char.id)}
                  className={`relative p-4 rounded-2xl text-left border-2 transition-all duration-300 group ${
                    p2 === char.id 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.02]' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: char.color, boxShadow: `0 0 15px ${char.color}` }} />
                    <span className="font-black text-[11px] text-white uppercase tracking-tight italic">{char.name}</span>
                  </div>
                  <p className="text-[9px] leading-tight text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter line-clamp-2">
                    {char.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Integrity Level</span>
                <span className="text-2xl font-black text-blue-400 italic tracking-tighter tabular-nums">{p2Health}<span className="text-xs ml-1 opacity-50">HP</span></span>
              </div>
              <input 
                type="range" min="10" max="1000" value={p2Health} 
                onChange={(e) => setP2Health(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mt-10">
        <button 
          onClick={handleStart}
          className="group relative px-24 py-8 overflow-hidden rounded-full transition-all duration-500 hover:scale-110 active:scale-95 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 group-hover:brightness-125 transition-all"></div>
          <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span className="relative z-10 text-white font-black text-4xl uppercase italic tracking-tighter text-glow text-center leading-none">START SIMULATION</span>
        </button>
      </div>
    </div>
  );
};

export default CharacterSelector;
