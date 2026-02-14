
import React, { useRef, useEffect, useState } from 'react';
import { BallState, WeaponType, Particle, TrailPoint, DamagePopup } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, WEAPON_OFFSET, FIBONACCI_SEQ, MAX_TRAIL_POINTS } from '../constants';
import { AudioEngine } from '../utils/AudioEngine';

interface Props {
  p1: BallState;
  p2: BallState;
  onGameOver: (winner: string) => void;
}

interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
}

const Arena: React.FC<Props> = ({ p1, p2, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{ p1: BallState; p2: BallState }>({ p1, p2 });
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<DamagePopup[]>([]);
  const lightsRef = useRef<LightSource[]>([]);
  const shakeRef = useRef<number>(0);
  const hitStopRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [v, setV] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const squashRef = useRef({ p1: 1, p2: 1 });
  const wallGlowRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // High DPI / Environment Resilience: Grid Pre-render
    if (!gridCanvasRef.current) {
      const gCanvas = document.createElement('canvas');
      gCanvas.width = ARENA_WIDTH;
      gCanvas.height = ARENA_HEIGHT;
      const gCtx = gCanvas.getContext('2d');
      if (gCtx) {
        gCtx.globalAlpha = 0.2;
        gCtx.strokeStyle = '#3b82f6';
        gCtx.lineWidth = 1.0;
        const gridSize = 40;
        for (let i = 0; i <= ARENA_WIDTH; i += gridSize) { gCtx.beginPath(); gCtx.moveTo(i, 0); gCtx.lineTo(i, ARENA_HEIGHT); gCtx.stroke(); }
        for (let i = 0; i <= ARENA_HEIGHT; i += gridSize) { gCtx.beginPath(); gCtx.moveTo(0, i); gCtx.lineTo(ARENA_WIDTH, i); gCtx.stroke(); }
        
        gCtx.globalAlpha = 0.05;
        gCtx.setLineDash([5, 5]);
        for (let i = 20; i <= ARENA_WIDTH; i += gridSize) { gCtx.beginPath(); gCtx.moveTo(i, 0); gCtx.lineTo(i, ARENA_HEIGHT); gCtx.stroke(); }
        for (let i = 20; i <= ARENA_HEIGHT; i += gridSize) { gCtx.beginPath(); gCtx.moveTo(0, i); gCtx.lineTo(ARENA_WIDTH, i); gCtx.stroke(); }
      }
      gridCanvasRef.current = gCanvas;
    }

    let requestRef: number;

    const spawnParticles = (x: number, y: number, color: string, count: number, speed: number = 12, gravity: number = 0.2) => {
      // Adjusted particle count for mobile stability
      const actualCount = Math.min(count, 15);
      if (particlesRef.current.length > 150) particlesRef.current.splice(0, actualCount);
      
      for (let i = 0; i < actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const s = Math.random() * speed + speed * 0.4;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * s,
          vy: Math.sin(angle) * s,
          life: 1.0,
          maxLife: Math.random() * 0.4 + 0.2,
          color,
          size: Math.random() * 5 + 1.5,
          friction: 0.94,
          gravity
        });
      }
    };

    const addLight = (x: number, y: number, radius: number, color: string, intensity: number = 1) => {
      if (lightsRef.current.length > 4) lightsRef.current.shift();
      lightsRef.current.push({ x, y, radius, color, intensity });
    };

    const addPopup = (x: number, y: number, text: string, color: string) => {
      popupsRef.current.push({ x, y, text, life: 1, color });
    };

    const update = () => {
      const { p1, p2 } = stateRef.current;
      if (!p1 || !p2) return;
      
      frameCountRef.current++;

      if (hitStopRef.current > 0) {
        hitStopRef.current--;
        draw();
        requestRef = requestAnimationFrame(update);
        return;
      }

      if (shakeRef.current > 0) shakeRef.current *= 0.9;
      if (wallGlowRef.current > 0) wallGlowRef.current *= 0.85;
      squashRef.current.p1 += (1 - squashRef.current.p1) * 0.2;
      squashRef.current.p2 += (1 - squashRef.current.p2) * 0.2;
      
      for (let i = lightsRef.current.length - 1; i >= 0; i--) {
        lightsRef.current[i].intensity *= 0.88;
        if (lightsRef.current[i].intensity < 0.1) lightsRef.current.splice(i, 1);
      }

      const SUB_STEPS = 2;
      for (let step = 0; step < SUB_STEPS; step++) {
        [p1, p2].forEach(b => {
          if (step === 0) {
            b.trails.unshift({ x: b.x, y: b.y });
            if (b.trails.length > MAX_TRAIL_POINTS) b.trails.pop();
          }

          b.x += (b.vx / SUB_STEPS);
          b.y += (b.vy / SUB_STEPS);

          const buffer = b.radius;
          if (b.x + buffer > ARENA_WIDTH || b.x - buffer < 0) {
            b.vx *= -1.05;
            b.x = b.x < buffer ? buffer : (b.x > ARENA_WIDTH - buffer ? ARENA_WIDTH - buffer : b.x);
            if (b.id === 'player1') squashRef.current.p1 = 0.4; else squashRef.current.p2 = 0.4;
            wallGlowRef.current = 20;
            spawnParticles(b.x, b.y, '#ffffff', 5, 12, 0.1);
            AudioEngine.playWallHit();
            shakeRef.current = Math.max(shakeRef.current, 5);
          }
          if (b.y + buffer > ARENA_HEIGHT || b.y - buffer < 0) {
            b.vy *= -1.05;
            b.y = b.y < buffer ? buffer : (b.y > ARENA_HEIGHT - buffer ? ARENA_HEIGHT - buffer : b.y);
            if (b.id === 'player1') squashRef.current.p1 = 0.4; else squashRef.current.p2 = 0.4;
            wallGlowRef.current = 20;
            spawnParticles(b.x, b.y, '#ffffff', 5, 12, 0.1);
            AudioEngine.playWallHit();
            shakeRef.current = Math.max(shakeRef.current, 5);
          }
        });

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = p1.radius + p2.radius;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist; const ny = dy / dist;
          const overlap = minDist - dist;
          p1.x -= nx * (overlap / 2); p1.y -= ny * (overlap / 2);
          p2.x += nx * (overlap / 2); p2.y += ny * (overlap / 2);

          const rvx = p2.vx - p1.vx; const rvy = p2.vy - p1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal < 0) {
            const impulse = -(1 + 0.98) * velAlongNormal / 2;
            p1.vx -= impulse * nx; p1.vy -= impulse * ny;
            p2.vx += impulse * nx; p2.vy += impulse * ny;
            handleDamage(p1, p2, false); handleDamage(p2, p1, false);
            addLight((p1.x + p2.x)/2, (p1.y + p2.y)/2, 180, '#ffffff', 0.9);
            AudioEngine.playBodyHit();
            shakeRef.current = Math.max(shakeRef.current, 8);
          }
        }
      }

      [p1, p2].forEach(b => {
        b.weaponAngle += b.weaponRotationSpeed * 2.2;
      });

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= p.friction; p.vy *= p.friction; p.vy += p.gravity;
        p.life -= 0.04;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      for (let i = popupsRef.current.length - 1; i >= 0; i--) {
        const p = popupsRef.current[i];
        p.y -= 2.5; p.life -= 0.03;
        if (p.life <= 0) popupsRef.current.splice(i, 1);
      }

      function handleDamage(attacker: BallState, defender: BallState, isWeaponHit: boolean) {
        const now = Date.now();
        if (now - defender.lastHitTime < 120) return;
        
        let dmg = 0; let isCrit = false;
        if (isWeaponHit) {
          switch(attacker.config.id) {
            case WeaponType.SWORD: dmg = attacker.config.baseDamage * attacker.currentDamageModifier; attacker.currentDamageModifier *= 1.35; break;
            case WeaponType.DAGGER: dmg = attacker.config.baseDamage; break;
            case WeaponType.ATLAS: dmg = attacker.config.baseDamage + (defender.x < 150 || defender.x > ARENA_WIDTH-150 ? 50 : 0); isCrit = dmg > attacker.config.baseDamage; break;
            case WeaponType.FIBONACCI: dmg = FIBONACCI_SEQ[attacker.hitCount % 10] * 1.8; attacker.hitCount++; break;
            case WeaponType.RATIO: dmg = Math.ceil(defender.health * 0.22); break;
            case WeaponType.ALGEBRA: dmg = 6 * (attacker.hitCount % 8) + 18; break;
            case WeaponType.KENDRICK: attacker.hitCount++; dmg = attacker.hitCount % 4 === 0 ? 85 : 15; isCrit = attacker.hitCount % 4 === 0; break;
            case WeaponType.GOLDEN_RATIO: attacker.hitCount++; dmg = attacker.config.baseDamage * Math.pow(1.618, Math.min(attacker.hitCount, 4)); isCrit = true; break;
            case WeaponType.E_MC2: 
              const v2 = (attacker.vx**2 + attacker.vy**2);
              dmg = attacker.config.baseDamage + (v2 * 0.12);
              isCrit = dmg > 50; break;
            case WeaponType.DR_WHO: 
              attacker.hitCount++;
              dmg = attacker.config.baseDamage;
              if (attacker.hitCount % 5 === 0) {
                const h = Math.ceil(attacker.maxHealth * 0.35);
                attacker.health = Math.min(attacker.maxHealth, attacker.health + h);
                addPopup(attacker.x, attacker.y - 80, `REGEN +${h}`, '#2563eb');
              } break;
            case WeaponType.THEORIZATION:
              const sec = (Date.now() - startTimeRef.current) / 1000;
              dmg = attacker.config.baseDamage + (sec * 2.8); break;
            case WeaponType.TIME_ITSELF:
              dmg = attacker.config.baseDamage;
              hitStopRef.current = 18; 
              shakeRef.current = 50; break;
            default: dmg = 10;
          }
        } else {
          dmg = Math.min(Math.sqrt(attacker.vx**2 + attacker.vy**2) * 1.8, 18);
        }

        if (dmg > 0) {
          defender.health -= Math.ceil(dmg);
          defender.lastHitTime = now;
          shakeRef.current = isCrit ? 50 : (isWeaponHit ? 25 : 12);
          hitStopRef.current = Math.max(hitStopRef.current, isCrit ? 12 : (isWeaponHit ? 6 : 3));
          addLight(defender.x, defender.y, isCrit ? 350 : 250, isCrit ? '#ff0000' : attacker.config.color, 1.3);
          if (isCrit) AudioEngine.playCrit(); else if (isWeaponHit) AudioEngine.playWeaponHit();
          addPopup(defender.x, defender.y - 50, isCrit ? `OBLITERATED -${Math.ceil(dmg)}` : `-${Math.ceil(dmg)}`, isCrit ? '#ff0033' : '#ffffff');
          spawnParticles(defender.x, defender.y, defender.config.color, isCrit ? 40 : 18, isCrit ? 18 : 12, 0.28);
        }
      }

      const w1x = p1.x + Math.cos(p1.weaponAngle) * WEAPON_OFFSET;
      const w1y = p1.y + Math.sin(p1.weaponAngle) * WEAPON_OFFSET;
      const w2x = p2.x + Math.cos(p2.weaponAngle) * WEAPON_OFFSET;
      const w2y = p2.y + Math.sin(p2.weaponAngle) * WEAPON_OFFSET;
      
      if (Math.sqrt((w1x-p2.x)**2 + (w1y-p2.y)**2) < p2.radius + 18) handleDamage(p1, p2, true);
      if (Math.sqrt((w2x-p1.x)**2 + (w2y-p1.y)**2) < p1.radius + 18) handleDamage(p2, p1, true);

      if (p1.health <= 0) onGameOver(p2.config.name);
      else if (p2.health <= 0) onGameOver(p1.config.name);

      draw();
      requestRef = requestAnimationFrame(update);
    };

    const draw = () => {
      const { p1, p2 } = stateRef.current;
      if (!p1 || !p2) return;
      
      ctx.save();
      
      if (shakeRef.current > 0.5) {
        ctx.translate((Math.random()-0.5) * shakeRef.current, (Math.random()-0.5) * shakeRef.current);
      }

      // Base Background
      ctx.fillStyle = '#010208';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      
      // Simpler Dynamic Background for Mobile
      const time = frameCountRef.current / 160;
      ctx.globalAlpha = 0.12;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(ARENA_WIDTH/2 + Math.cos(time)*140, ARENA_HEIGHT/2 + Math.sin(time*0.8)*90, 450, 0, Math.PI*2);
      ctx.fill();

      // Pre-rendered Grid
      if (gridCanvasRef.current) {
        ctx.drawImage(gridCanvasRef.current, 0, 0);
      }

      // Lights
      ctx.globalCompositeOperation = 'screen';
      lightsRef.current.forEach(l => {
        ctx.globalAlpha = l.intensity * 0.5;
        const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius);
        grad.addColorStop(0, l.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.radius, 0, Math.PI*2); ctx.fill();
      });

      // Motion Trails
      [p1, p2].forEach(b => {
        b.trails.forEach((pt, i) => {
          const ratio = (1 - i / b.trails.length);
          ctx.globalAlpha = ratio * 0.35;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, b.radius * (0.5 + ratio * 0.5), 0, Math.PI*2);
          ctx.fillStyle = b.config.color;
          ctx.fill();
        });
      });

      // Particles
      ctx.globalCompositeOperation = 'source-over';
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      // Spheres
      [p1, p2].forEach(b => {
        const sq = b.id === 'player1' ? squashRef.current.p1 : squashRef.current.p2;
        const hit = (Date.now() - b.lastHitTime < 140);
        const flash = hit && (Math.floor(Date.now() / 25) % 2 === 0);
        
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx));
        ctx.scale(1/sq, sq);

        // Core Body
        ctx.globalAlpha = 1.0;
        const bodyGrad = ctx.createRadialGradient(-b.radius*0.3, -b.radius*0.3, 0, 0, 0, b.radius);
        bodyGrad.addColorStop(0, flash ? '#ffffff' : b.config.color);
        bodyGrad.addColorStop(0.7, b.config.color);
        bodyGrad.addColorStop(1, '#000000');
        ctx.beginPath(); ctx.arc(0, 0, b.radius, 0, Math.PI*2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Polish Highlight
        const specGrad = ctx.createRadialGradient(-b.radius*0.4, -b.radius*0.4, 0, -b.radius*0.4, -b.radius*0.4, b.radius*0.6);
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = specGrad;
        ctx.beginPath(); ctx.ellipse(-b.radius*0.4, -b.radius*0.4, b.radius*0.4, b.radius*0.25, Math.PI/4, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();

        // Weapons
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.weaponAngle);
        ctx.translate(WEAPON_OFFSET, 0);

        const weaponCol = b.config.color;
        const wTime = Date.now() / 1000;

        switch(b.config.id) {
          case WeaponType.SWORD:
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(68,0); ctx.lineTo(0,7); ctx.fill();
            ctx.strokeStyle = weaponCol; ctx.lineWidth=3; ctx.stroke(); break;
          case WeaponType.DAGGER:
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(45,0); ctx.lineTo(0,5); ctx.fill();
            ctx.strokeStyle = weaponCol; ctx.stroke(); break;
          case WeaponType.ATLAS:
            ctx.beginPath(); ctx.arc(0,0, 24, 0, Math.PI*2); ctx.strokeStyle=weaponCol; ctx.lineWidth=6; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0,0, 12, 0, Math.PI*2); ctx.fill(); break;
          case WeaponType.FIBONACCI:
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath();
            let phi = 1; for(let i=0; i<28; i++) { phi *= 1.08; const a = i * 0.45; ctx.lineTo(Math.cos(a)*phi, Math.sin(a)*phi); }
            ctx.stroke(); break;
          case WeaponType.RATIO:
            const rs = (b.id==='player1'?p2:p1).health / (b.id==='player1'?p2:p1).maxHealth;
            ctx.strokeStyle=weaponCol; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(0,0,30, -Math.PI/2, -Math.PI/2 + Math.PI*2*rs); ctx.stroke();
            ctx.fillStyle='#fff'; ctx.font='900 18px sans-serif'; ctx.textAlign='center'; ctx.fillText(`${Math.round(rs*100)}`, 0, 7); break;
          case WeaponType.ALGEBRA:
            ctx.font = '900 32px serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('Δ', 0, 11);
            ctx.strokeStyle=weaponCol; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,34,0,Math.PI*2); ctx.stroke(); break;
          case WeaponType.KENDRICK:
            ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.moveTo(-20, 16); ctx.lineTo(-20, -16); ctx.lineTo(-9, 0); ctx.lineTo(0, -24); ctx.lineTo(9, 0); ctx.lineTo(20, -16); ctx.lineTo(20, 16); ctx.closePath(); ctx.fill(); break;
          case WeaponType.GOLDEN_RATIO:
            ctx.strokeStyle='#fbbf24'; ctx.lineWidth=5; ctx.strokeRect(-20, -12, 40, 24);
            ctx.fillStyle='#fff'; ctx.font='900 22px serif'; ctx.fillText('Φ', -8, 8); break;
          case WeaponType.E_MC2:
            ctx.beginPath(); ctx.arc(0,0, 20, 0, Math.PI*2); ctx.fillStyle='#ef4444'; ctx.fill();
            ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.stroke(); break;
          case WeaponType.DR_WHO:
            ctx.fillStyle='#1e3a8a'; ctx.fillRect(-15, -24, 30, 48);
            ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.strokeRect(-15, -24, 30, 48); break;
          case WeaponType.THEORIZATION:
            ctx.rotate(wTime*3); ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=4; ctx.strokeRect(-20,-20, 40, 40);
            ctx.beginPath(); ctx.arc(0,0, 10, 0, Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); break;
          case WeaponType.TIME_ITSELF:
            ctx.beginPath(); ctx.arc(0,0, 32, 0, Math.PI*2); ctx.strokeStyle='#10b981'; ctx.lineWidth=6; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(wTime*8)*24, Math.sin(wTime*8)*24); ctx.stroke(); break;
          default:
            ctx.beginPath(); ctx.arc(0,0, 14, 0, Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
        }
        ctx.restore();
      });

      // Popups
      popupsRef.current.forEach(p => {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.font = `900 ${26 + p.life*14}px sans-serif`; ctx.textAlign='center';
        ctx.fillText(p.text, p.x, p.y);
      });

      ctx.restore();
      if (frameCountRef.current % 4 === 0) setV(v => v + 1);
    };

    requestRef = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef);
  }, [onGameOver]);

  const { p1: ball1, p2: ball2 } = stateRef.current;

  return (
    <div className="relative w-full max-w-[95vw] lg:max-w-7xl flex flex-col items-center overflow-hidden">
      <div className="w-full flex justify-between items-end mb-8 px-4 md:px-10">
        <div className="w-[44%] group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 gap-1">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[11px] font-black text-red-500/80 uppercase tracking-[0.5em] mb-1">Meme Dubbers</span>
              <span className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter truncate max-w-[120px] md:max-w-none">{ball1.config.name}</span>
            </div>
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none tabular-nums">{Math.max(0, Math.ceil(ball1.health))}</span>
          </div>
          <div className="h-4 md:h-5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-2xl relative">
            <div 
              className={`h-full bg-gradient-to-r from-red-800 via-red-500 to-red-300 rounded-full transition-all duration-300 ease-out ${ball1.health < 30 ? 'animate-pulse' : ''}`} 
              style={{ width: `${(ball1.health / ball1.maxHealth) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-1 scale-75 md:scale-100">
            <div className="text-[12px] font-black text-white/50 uppercase tracking-[0.9em] mb-4 animate-pulse italic">SYNC</div>
            <div className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-transparent via-white/80 to-transparent" />
        </div>

        <div className="w-[44%] text-right group">
          <div className="flex flex-col md:flex-row-reverse justify-between items-end md:items-end mb-3 gap-1">
            <div className="flex flex-col text-right">
              <span className="text-[9px] md:text-[11px] font-black text-blue-500/80 uppercase tracking-[0.5em] mb-1">The Overlords</span>
              <span className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter truncate max-w-[120px] md:max-w-none">{ball2.config.name}</span>
            </div>
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none tabular-nums">{Math.max(0, Math.ceil(ball2.health))}</span>
          </div>
          <div className="h-4 md:h-5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-2xl relative">
            <div 
              className={`h-full bg-gradient-to-l from-blue-800 via-blue-500 to-blue-300 rounded-full transition-all duration-300 ease-out ml-auto ${ball2.health < 30 ? 'animate-pulse' : ''}`} 
              style={{ width: `${(ball2.health / ball2.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative p-2 md:p-4 bg-slate-900/70 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_-25px_rgba(0,0,0,1)] border-[4px] md:border-[8px] border-white/5 crt overflow-hidden group">
        <canvas 
          ref={canvasRef} 
          width={ARENA_WIDTH} 
          height={ARENA_HEIGHT} 
          className="rounded-[2.2rem] md:rounded-[3.5rem] w-full h-auto max-h-[60vh] md:max-h-[75vh] block bg-black"
        />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10 rounded-[2.2rem] md:rounded-[3.5rem]" />
      </div>
      
      <div className="mt-8 md:mt-14 flex flex-wrap justify-center gap-8 md:gap-28 text-[10px] md:text-[13px] font-black uppercase tracking-[0.8em] text-slate-500 italic pb-10">
        <span className="flex items-center gap-4 text-green-500">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500 animate-pulse" /> 
          Neural Core: Ready
        </span>
        <span className="text-slate-700">Iter: {Math.floor(frameCountRef.current / 60)}</span>
      </div>
    </div>
  );
};

export default Arena;
