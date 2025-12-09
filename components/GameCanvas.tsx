import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  EntityType, 
  Particle,
  Level,
  LevelObject
} from '../types';
import { 
  GRAVITY, 
  JUMP_FORCE, 
  MOVE_SPEED, 
  PLAYER_SIZE, 
  TILE_SIZE, 
  PLAYER_COLOR,
  ROTATION_SPEED
} from '../constants';
import { audioManager } from '../services/audioManager';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (percent: number) => void;
  setAttempts: React.Dispatch<React.SetStateAction<number>>;
  level: Level;
  particleDensity: number;
  onStatsUpdate: (jumped: boolean, died: boolean) => void;
  editorTool?: EntityType | 'ERASE';
  setCustomLevelData?: (data: LevelObject[]) => void;
  isPracticeMode: boolean;
}

interface Checkpoint {
    x: number;
    y: number;
    dy: number;
    angle: number;
    isGrounded: boolean;
    camX: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState,
  setScore,
  setAttempts,
  level,
  particleDensity,
  onStatsUpdate,
  editorTool,
  setCustomLevelData,
  isPracticeMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  // State Refs
  const gameStateRef = useRef(gameState);
  const isHoldingJumpRef = useRef(false); 
  const isDraggingEditor = useRef(false);
  const lastEditorPos = useRef({ x: 0, y: 0 });
  const isPracticeModeRef = useRef(isPracticeMode);
  
  // Visual Effect Refs
  const orbGlowRef = useRef(0);
  const lastOrbHitRef = useRef<number>(-1);
  const shakeRef = useRef(0);
  const pulseRef = useRef(0);

  // Checkpoints
  const checkpointsRef = useRef<Checkpoint[]>([]);

  // Update refs when props change
  useEffect(() => {
    gameStateRef.current = gameState;
    isPracticeModeRef.current = isPracticeMode;
    if (gameState !== GameState.PLAYING) {
        // Clear checkpoints on exit
        if (gameState !== GameState.GAME_OVER) checkpointsRef.current = [];
    }
  }, [gameState, isPracticeMode]);

  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    dy: 0,
    angle: 0,
    isGrounded: false,
    isDead: false,
    jumpCount: 0
  });
  
  const cameraXRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef(0);
  
  const menuFloatingObjsRef = useRef<{x: number, y: number, size: number, speed: number, rot: number}[]>([]);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 0,
      y: 0, 
      dy: 0,
      angle: 0,
      isGrounded: true,
      isDead: false,
      jumpCount: 0
    };
    cameraXRef.current = 0;
    particlesRef.current = [];
    isHoldingJumpRef.current = false; 
    orbGlowRef.current = 0;
    lastOrbHitRef.current = -1;
    shakeRef.current = 0;
    
    // In practice mode, we might want to clear checkpoints on full reset? 
    // Usually full reset clears them.
    if (!isPracticeModeRef.current) {
        checkpointsRef.current = [];
    }
    
    if (gameStateRef.current !== GameState.EDITOR) {
      audioManager.startMusic();
    }
  }, []);

  const placeCheckpoint = () => {
      if (gameStateRef.current !== GameState.PLAYING || !isPracticeModeRef.current) return;
      if (playerRef.current.isDead) return;

      const p = playerRef.current;
      checkpointsRef.current.push({
          x: p.x,
          y: p.y,
          dy: p.dy,
          angle: p.angle,
          isGrounded: p.isGrounded,
          camX: cameraXRef.current
      });
      // Visual feedback
      spawnParticles(p.x + PLAYER_SIZE/2, p.y + PLAYER_SIZE/2, '#00FF00', 10, 'CIRCLE');
  };

  const removeCheckpoint = () => {
      if (gameStateRef.current !== GameState.PLAYING || !isPracticeModeRef.current) return;
      if (checkpointsRef.current.length > 0) {
          const p = checkpointsRef.current.pop();
          if (p) spawnParticles(p.x + PLAYER_SIZE/2, p.y + PLAYER_SIZE/2, '#FF0000', 10, 'SQUARE');
      }
  };

  const respawnPractice = () => {
      if (checkpointsRef.current.length > 0) {
          const cp = checkpointsRef.current[checkpointsRef.current.length - 1];
          playerRef.current = {
              ...playerRef.current,
              x: cp.x,
              y: cp.y,
              dy: cp.dy,
              angle: cp.angle,
              isGrounded: cp.isGrounded,
              isDead: false,
          };
          cameraXRef.current = cp.camX;
          playerRef.current.dy = cp.dy; // Important to preserve momentum if saved in air
          shakeRef.current = 5;
          // Don't restart music, just let it loop or continue
      } else {
          resetGame();
      }
  };

  // Initialize menu background objects
  useEffect(() => {
    const objs = [];
    for(let i=0; i<20; i++) {
        objs.push({
            x: Math.random() * 2000,
            y: Math.random() * 1000,
            size: Math.random() * 100 + 20,
            speed: Math.random() * 2 + 0.5,
            rot: Math.random() * Math.PI
        });
    }
    menuFloatingObjsRef.current = objs;
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number, type: 'SQUARE' | 'CIRCLE' = 'SQUARE') => {
    const adjustedCount = Math.floor(count * particleDensity);
    if (adjustedCount <= 0) return;

    for (let i = 0; i < adjustedCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * 5 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: 1.0,
        color: color,
        size: Math.random() * 6 + 4,
        type
      });
    }
  };

  const spawnTrail = (x: number, y: number) => {
    if (orbGlowRef.current > 0) {
        particlesRef.current.push({
            x: x + PLAYER_SIZE / 2, 
            y: y + PLAYER_SIZE / 2,
            vx: -MOVE_SPEED * 0.1, 
            vy: (Math.random() - 0.5) * 2,
            life: 0.6,
            color: 'rgba(255, 255, 0, 0.6)', 
            size: PLAYER_SIZE * 0.5,
            type: 'CIRCLE'
        });
    } else {
        particlesRef.current.push({
            x: x + PLAYER_SIZE / 2, 
            y: y + PLAYER_SIZE / 2,
            vx: -MOVE_SPEED * 0.2, 
            vy: (Math.random() - 0.5),
            life: 0.4,
            color: 'rgba(255, 255, 255, 0.3)',
            size: PLAYER_SIZE * 0.6,
            type: 'SQUARE'
        });
    }
  };

  // Input Listeners
  useEffect(() => {
    const handleStart = (e: KeyboardEvent | PointerEvent) => {
      // EDITOR MODE INPUTS
      if (gameStateRef.current === GameState.EDITOR) {
         if (e instanceof PointerEvent) {
             const canvas = canvasRef.current;
             if (!canvas) return;
             const rect = canvas.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const y = e.clientY - rect.top;
             
             // Convert to world coords
             const worldX = x + cameraXRef.current;
             const floorY = canvas.height - 120;
             const worldY = floorY - y; // distance from floor
             
             const gridX = Math.floor(worldX / TILE_SIZE);
             const gridY = Math.floor(worldY / TILE_SIZE);

             if (e.button === 0) { // Left Click - Place/Erase
                 if (gridY < 0) return; // Don't place under floor
                 if (!editorTool || !setCustomLevelData) return;

                 const newLevelData = [...level.data];
                 
                 // Remove existing at this slot
                 const existingIdx = newLevelData.findIndex(o => 
                    Math.abs(o.x - gridX * TILE_SIZE) < 5 && Math.abs(o.y - gridY * TILE_SIZE) < 5
                 );
                 
                 if (existingIdx !== -1) {
                     newLevelData.splice(existingIdx, 1);
                 }

                 if (editorTool !== 'ERASE') {
                     newLevelData.push({
                         id: Date.now(),
                         type: editorTool,
                         x: gridX * TILE_SIZE,
                         y: gridY
                     });
                 }
                 setCustomLevelData(newLevelData);
             } else if (e.button === 1 || e.button === 2) { // Middle/Right Click - Pan
                 isDraggingEditor.current = true;
                 lastEditorPos.current = { x: e.clientX, y: e.clientY };
             }
         }
         return;
      }

      // GAMEPLAY INPUTS
      if (gameStateRef.current !== GameState.PLAYING) return;
      
      if (e instanceof KeyboardEvent) {
          if (e.code === 'KeyZ') {
              placeCheckpoint();
              return;
          }
          if (e.code === 'KeyX') {
              removeCheckpoint();
              return;
          }
      }

      if (e instanceof KeyboardEvent && (e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyW')) return;
      if (e instanceof PointerEvent && e.button !== 0) return;
      isHoldingJumpRef.current = true;
    };

    const handleEnd = (e: KeyboardEvent | PointerEvent) => {
       if (gameStateRef.current === GameState.EDITOR) {
           isDraggingEditor.current = false;
           return;
       }
       if (e instanceof KeyboardEvent && (e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyW')) return;
       if (e instanceof PointerEvent && e.button !== 0) return;
       isHoldingJumpRef.current = false;
    };
    
    const handleMove = (e: PointerEvent) => {
        if (gameStateRef.current === GameState.EDITOR && isDraggingEditor.current) {
            const dx = e.clientX - lastEditorPos.current.x;
            cameraXRef.current -= dx;
            lastEditorPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    window.addEventListener('keydown', handleStart);
    window.addEventListener('keyup', handleEnd);
    window.addEventListener('pointerdown', handleStart);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointerleave', handleEnd);
    window.addEventListener('pointermove', handleMove);
    window.oncontextmenu = (e) => e.preventDefault(); // Block context menu for editor

    return () => {
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('keyup', handleEnd);
      window.removeEventListener('pointerdown', handleStart);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointerleave', handleEnd);
      window.removeEventListener('pointermove', handleMove);
      window.oncontextmenu = null;
    };
  }, [gameState, editorTool, level.data, setCustomLevelData, isPracticeMode]);

  const loop = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    const deltaTime = Math.min(time - lastTimeRef.current, 50); 
    lastTimeRef.current = time;

    const width = canvas.width;
    const height = canvas.height;
    const FLOOR_Y_SCREEN = height - 120;
    
    // Beat Pulse Logic
    pulseRef.current = (Math.sin(time / 200) + 1) * 0.5; // 0 to 1

    // --- MENU BACKGROUND LOGIC ---
    if (gameStateRef.current === GameState.MENU || gameStateRef.current === GameState.LEVEL_SELECT) {
        cameraXRef.current += 2; 

        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#a000c0'); 
        bgGradient.addColorStop(1, '#600090'); 
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        const bgOffset = -(cameraXRef.current * 0.2) % 150;
        
        ctx.beginPath();
        for (let i = 0; i < width + 150; i += 150) {
            ctx.moveTo(i + bgOffset, 0);
            ctx.lineTo(i + bgOffset, height);
        }
        for(let i=0; i<height; i+=150) {
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for(const obj of menuFloatingObjsRef.current) {
            obj.x -= obj.speed;
            if (obj.x < -200) obj.x = width + 200;
            obj.rot += 0.01;
            ctx.save();
            ctx.translate(obj.x, obj.y);
            ctx.rotate(obj.rot);
            ctx.fillRect(-obj.size/2, -obj.size/2, obj.size, obj.size);
            ctx.restore();
        }
        ctx.restore();
        animationFrameRef.current = requestAnimationFrame(() => loop(performance.now()));
        return;
    }

    // --- PLAYING LOGIC ---
    if (gameStateRef.current === GameState.PLAYING || gameStateRef.current === GameState.GAME_OVER || gameStateRef.current === GameState.VICTORY) {
      const p = playerRef.current;

      if (gameStateRef.current === GameState.PLAYING) {
        if (p.isGrounded && isHoldingJumpRef.current) {
           p.dy = JUMP_FORCE;
           p.isGrounded = false;
           audioManager.playJump();
           // Particle Burst on Jump
           spawnParticles(p.x + PLAYER_SIZE/2, p.y + 5, '#A5F3FC', 15, 'CIRCLE');
           onStatsUpdate(true, false);
        }

        p.x += MOVE_SPEED;
        p.dy -= GRAVITY; 
        p.y += p.dy;

        if (p.y < 0) {
            p.y = 0;
            p.dy = 0;
            p.isGrounded = true;
            lastOrbHitRef.current = -1; 
            const nearest90 = Math.round(p.angle / (Math.PI / 2)) * (Math.PI / 2);
            const diff = nearest90 - p.angle;
            p.angle += diff * 0.2;
        } else {
           p.isGrounded = false;
           p.angle += ROTATION_SPEED;
        }

        let trailFreq = Math.round(3 / Math.max(0.1, particleDensity));
        if (orbGlowRef.current > 0) trailFreq = 1; 
        if (animationFrameRef.current % trailFreq === 0) {
            spawnTrail(p.x, p.y); 
        }

        if (orbGlowRef.current > 0) orbGlowRef.current--;

        // Collision
        const nearby = level.data.filter(o => o.x > p.x - 100 && o.x < p.x + 150);
        
        const pLeft = p.x + 8; 
        const pRight = p.x + PLAYER_SIZE - 8;
        const pBottom = p.y;
        const pTop = p.y + PLAYER_SIZE - 5;

        for (const obj of nearby) {
            const objW = TILE_SIZE;
            const objH = TILE_SIZE; 
            const objLeft = obj.x;
            const objRight = obj.x + objW;
            const objBottom = obj.y * TILE_SIZE;
            const objTop = objBottom + objH;
            
            // --- PAD COLLISION LOGIC ---
            if (obj.type === EntityType.PAD) {
                // Pads are smaller, on the floor
                const padH = 15;
                const padTop = objBottom + padH;
                
                const colX = pRight > objLeft + 10 && pLeft < objRight - 10;
                const colY = pBottom < padTop && pBottom > objBottom - 10 && p.dy < 0; // Coming down

                if (colX && colY) {
                    p.dy = JUMP_FORCE * 1.5; // Super Jump
                    p.isGrounded = false;
                    audioManager.playJump();
                    spawnParticles(obj.x + TILE_SIZE/2, obj.y * TILE_SIZE, '#FFFF00', 10, 'CIRCLE');
                    onStatsUpdate(true, false);
                }
                continue; // Skip standard block collision for pads
            }

            let hitboxMarginX = 6;
            let hitboxMarginY = 6;
            
            if (obj.type === EntityType.SPIKE) {
               hitboxMarginX = 18; 
               hitboxMarginY = 15; 
            }

            const collisionX = pRight > objLeft + hitboxMarginX && pLeft < objRight - hitboxMarginX;
            const collisionY = pTop > objBottom + hitboxMarginY && pBottom < objTop - hitboxMarginY;

            if (collisionX && collisionY) {
                if (obj.type === EntityType.SPIKE || obj.type === EntityType.BLOCK) {
                     // Block collision fix for landing on top
                    if (obj.type === EntityType.BLOCK) {
                        const prevY = p.y - p.dy; 
                        if (prevY >= objTop - 25 && p.dy <= 0) {
                            p.y = objTop;
                            p.dy = 0;
                            p.isGrounded = true;
                            lastOrbHitRef.current = -1;
                            const nearest90 = Math.round(p.angle / (Math.PI / 2)) * (Math.PI / 2);
                            const diff = nearest90 - p.angle;
                            p.angle += diff * 0.2;
                            continue; // Landed safely
                        } 
                    }

                    // DEATH LOGIC
                    audioManager.playDeath();
                    spawnParticles(p.x + PLAYER_SIZE/2, p.y + PLAYER_SIZE/2, PLAYER_COLOR.primary, 30);
                    onStatsUpdate(false, true);
                    shakeRef.current = 20;

                    if (isPracticeModeRef.current) {
                        respawnPractice();
                    } else {
                        setGameState(GameState.GAME_OVER);
                        setAttempts(prev => prev + 1);
                    }
                } else if (obj.type === EntityType.ORB) {
                    if (isHoldingJumpRef.current && lastOrbHitRef.current !== obj.id) {
                         p.dy = JUMP_FORCE * 1.15;
                         p.isGrounded = false;
                         lastOrbHitRef.current = obj.id;
                         orbGlowRef.current = 20; 
                         audioManager.playJump();
                         spawnParticles(obj.x + TILE_SIZE/2, p.y + PLAYER_SIZE/2, '#FFFF00', 15, 'CIRCLE');
                         onStatsUpdate(true, false);
                    }
                }
            }
        }
        
        setScore(Math.min(100, Math.floor((p.x / level.length) * 100)));
        if (p.x >= level.length) {
            setGameState(GameState.VICTORY);
        }
      }

      const targetCamX = playerRef.current.x - 200;
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.5;
    }

    // --- RENDER ALL STATES ---
    
    // Background Pulse
    let bgBase = level.theme.background;
    if (pulseRef.current > 0.8 && gameStateRef.current === GameState.PLAYING) {
       // Lighten BG on beat
    }

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, bgBase);
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Pulse Overlay
    if (gameStateRef.current === GameState.PLAYING) {
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseRef.current * 0.05})`;
        ctx.fillRect(0, 0, width, height);
    }
    
    ctx.save();
    
    // Screen Shake
    if (shakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(shakeX, shakeY);
        shakeRef.current *= 0.9;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
    }

    // Parallax Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const bgOffset = -(cameraXRef.current * 0.1) % 100;
    ctx.beginPath();
    for (let i = 0; i < width + 100; i += 100) {
        ctx.moveTo(i + bgOffset, 0);
        ctx.lineTo(i + bgOffset, height);
    }
    for(let i=0; i<height; i+=100) {
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
    }
    ctx.stroke();

    // Editor Grid
    if (gameStateRef.current === GameState.EDITOR) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        const camOffset = -(cameraXRef.current) % TILE_SIZE;
        ctx.beginPath();
        // Vertical
        for (let i = 0; i < width + TILE_SIZE; i += TILE_SIZE) {
            ctx.moveTo(i + camOffset, 0);
            ctx.lineTo(i + camOffset, height);
        }
        // Horizontal relative to floor
        for(let i=0; i<15; i++) {
             const y = FLOOR_Y_SCREEN - (i * TILE_SIZE);
             ctx.moveTo(0, y);
             ctx.lineTo(width, y);
        }
        ctx.stroke();
        
        // Floor line in Editor
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, FLOOR_Y_SCREEN);
        ctx.lineTo(width, FLOOR_Y_SCREEN);
        ctx.stroke();
    }

    // Draw Floor (Playing)
    if (gameStateRef.current !== GameState.EDITOR) {
        ctx.fillStyle = level.theme.floor;
        ctx.fillRect(0, FLOOR_Y_SCREEN, width, height - FLOOR_Y_SCREEN);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(0, FLOOR_Y_SCREEN, width, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        const floorOffset = -(cameraXRef.current) % TILE_SIZE;
        for(let i = -1; i < (width/TILE_SIZE) + 1; i++) {
            ctx.fillRect(floorOffset + (i * TILE_SIZE), FLOOR_Y_SCREEN, 4, height - FLOOR_Y_SCREEN);
        }
    }

    // Apply Camera
    ctx.translate(-cameraXRef.current, 0);

    // Draw Checkpoints
    if (isPracticeModeRef.current && gameStateRef.current === GameState.PLAYING) {
        for (const cp of checkpointsRef.current) {
            const screenY = FLOOR_Y_SCREEN - cp.y;
            const size = 15;
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.moveTo(cp.x + PLAYER_SIZE/2, screenY - size);
            ctx.lineTo(cp.x + PLAYER_SIZE/2 + size/2, screenY - size/2);
            ctx.lineTo(cp.x + PLAYER_SIZE/2, screenY);
            ctx.lineTo(cp.x + PLAYER_SIZE/2 - size/2, screenY - size/2);
            ctx.fill();
        }
    }

    // Draw Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 0.03;
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        const screenPY = FLOOR_Y_SCREEN - p.y;
        
        if (p.type === 'SQUARE') {
              ctx.fillRect(p.x - p.size/2, screenPY - p.size/2, p.size, p.size);
        } else {
              ctx.beginPath();
              ctx.arc(p.x, screenPY, p.size, 0, Math.PI * 2);
              ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Draw Level Objects
    const renderStart = cameraXRef.current - 100;
    const renderEnd = cameraXRef.current + width + 100;
    
    const visibleObjects = level.data.filter(o => o.x > renderStart && o.x < renderEnd);

    for (const obj of visibleObjects) {
        const screenY = FLOOR_Y_SCREEN - (obj.y * TILE_SIZE);
        const drawY = screenY - TILE_SIZE; 
        
        if (obj.type === EntityType.BLOCK) {
            ctx.fillStyle = level.theme.objPrimary; 
            ctx.fillRect(obj.x, drawY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(obj.x, drawY, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = level.theme.objSecondary;
            ctx.fillRect(obj.x + 10, drawY + 10, TILE_SIZE - 20, TILE_SIZE - 20);

        } else if (obj.type === EntityType.SPIKE) {
            ctx.beginPath();
            ctx.moveTo(obj.x, drawY + TILE_SIZE); 
            ctx.lineTo(obj.x + TILE_SIZE / 2, drawY); 
            ctx.lineTo(obj.x + TILE_SIZE, drawY + TILE_SIZE); 
            ctx.closePath();
            ctx.fillStyle = level.theme.spike;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (obj.type === EntityType.ORB) {
            const centerX = obj.x + TILE_SIZE/2;
            const centerY = drawY + TILE_SIZE/2;
            const pulse = Math.sin(performance.now() / 150) * 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 14 + pulse, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI*2);
            ctx.fillStyle = '#FFFF00';
            ctx.fill();
        } else if (obj.type === EntityType.PAD) {
            // Draw PAD (Flat yellow rect on floor/block)
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(obj.x + TILE_SIZE/2, drawY + TILE_SIZE, TILE_SIZE/2, Math.PI, 0); // Semi circle
            ctx.fill();
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x, drawY + TILE_SIZE);
            ctx.lineTo(obj.x + TILE_SIZE, drawY + TILE_SIZE);
            ctx.stroke();
            
            // Inner glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(obj.x + 10, drawY + TILE_SIZE - 5, TILE_SIZE - 20, 5);
        }
    }

    // Draw Player
    if (gameStateRef.current !== GameState.GAME_OVER && gameStateRef.current !== GameState.VICTORY && gameStateRef.current !== GameState.EDITOR) {
        const p = playerRef.current;
        const screenY = FLOOR_Y_SCREEN - p.y; 
        const centerX = p.x + PLAYER_SIZE / 2;
        const centerY = screenY - PLAYER_SIZE / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(p.angle);
        
        if (orbGlowRef.current > 0) {
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 30;
        }

        ctx.fillStyle = PLAYER_COLOR.primary;
        ctx.fillRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
        ctx.strokeStyle = PLAYER_COLOR.border;
        ctx.lineWidth = 3;
        ctx.strokeRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
        ctx.fillStyle = PLAYER_COLOR.secondary;
        ctx.fillRect(-PLAYER_SIZE/4, -PLAYER_SIZE/4, PLAYER_SIZE/2, PLAYER_SIZE/2);
        
        ctx.shadowBlur = 0;
        ctx.rotate(-p.angle);
        ctx.translate(-centerX, -centerY);
    }

    ctx.restore();
    animationFrameRef.current = requestAnimationFrame(() => loop(performance.now()));
  }, [level, setGameState, setScore, setAttempts, particleDensity, editorTool, setCustomLevelData, onStatsUpdate, isPracticeMode]);

  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame((t) => loop(t));

    if (gameState === GameState.MENU) {
        resetGame();
    }
    
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, loop, resetGame]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER && !isPracticeMode) {
        const timeout = setTimeout(() => {
            resetGame();
            setGameState(GameState.PLAYING);
        }, 800);
        return () => clearTimeout(timeout);
    }
  }, [gameState, resetGame, setGameState, isPracticeMode]);

  // Expose checkpoint method via DOM event or Context would be cleaner, but simple approach:
  // We handle keypresses inside useEffect, but for mobile buttons we might need external control.
  // For now, keypresses Z and X handle it.
  
  return (
    <>
        <canvas ref={canvasRef} className="block w-full h-full cursor-pointer select-none touch-none" />
        {isPracticeMode && gameState === GameState.PLAYING && (
            <div className="absolute top-24 left-4 flex flex-col gap-2 z-20 pointer-events-auto">
                 <button 
                    onClick={placeCheckpoint}
                    className="bg-green-600 border-2 border-green-300 text-white p-2 rounded-lg font-bold shadow text-xs"
                 >
                    Checkpoint (Z)
                 </button>
                 <button 
                    onClick={removeCheckpoint}
                    className="bg-red-600 border-2 border-red-300 text-white p-2 rounded-lg font-bold shadow text-xs"
                 >
                    Remove (X)
                 </button>
            </div>
        )}
    </>
  );
};