import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState, Level, EntityType, LevelObject, Achievement, GameStats } from './types';
import { LEVELS, ACHIEVEMENTS, TILE_SIZE } from './constants';
import { 
  Play, RotateCcw, Trophy, Menu, Music, Star, ChevronLeft, Settings, X, 
  Keyboard, MousePointer2, BarChart2, Hammer, Gamepad2, User, Facebook, 
  Twitter, Youtube, Wrench, Eraser, Save, Square, Triangle, Circle,
  Diamond, Flag
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Settings & Tools
  const [particleDensity, setParticleDensity] = useState(1.0); 
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Editor State
  const [editorTool, setEditorTool] = useState<EntityType | 'ERASE'>(EntityType.BLOCK);
  const [customLevelData, setCustomLevelData] = useState<LevelObject[]>([]);
  const [customLevel, setCustomLevel] = useState<Level>({
      id: 999,
      name: "Custom Level",
      difficulty: "UNKNOWN",
      bpm: 150,
      length: 100 * TILE_SIZE,
      data: [],
      theme: {
          background: '#444444',
          floor: '#222222',
          objPrimary: '#888888',
          objSecondary: '#666666',
          spike: '#DDDDDD'
      }
  });

  // Achievement Stats
  const [gameStats, setGameStats] = useState<GameStats>({
      totalJumps: 0,
      totalAttempts: 0,
      totalDeaths: 0,
      levelProgress: {} // ID -> Percent
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update Custom Level Object when data changes
  useEffect(() => {
      setCustomLevel(prev => ({ ...prev, data: customLevelData }));
  }, [customLevelData]);

  // Handle Stats & Achievements
  const handleStatsUpdate = (jumped: boolean, died: boolean) => {
      setGameStats(prev => {
          const newStats = { ...prev };
          if (jumped) newStats.totalJumps++;
          if (died) {
              newStats.totalDeaths++;
              newStats.totalAttempts++; 
          }
          checkAchievements(newStats);
          return newStats;
      });
  };

  // Update Percentage on death or win
  useEffect(() => {
      if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
          if (currentLevel.id !== 999 && !isPracticeMode) {
              setGameStats(prev => {
                  const currentBest = prev.levelProgress[currentLevel.id] || 0;
                  // If Victory, force 100. If Game Over, take current score.
                  const newPercent = gameState === GameState.VICTORY ? 100 : score;
                  if (newPercent > currentBest) {
                      return {
                          ...prev,
                          levelProgress: {
                              ...prev.levelProgress,
                              [currentLevel.id]: newPercent
                          }
                      };
                  }
                  return prev;
              });
          }
      }
  }, [gameState, score, currentLevel.id, isPracticeMode]);

  const checkAchievements = (stats: GameStats) => {
      ACHIEVEMENTS.forEach(ach => {
          if (!unlockedAchievements.includes(ach.id) && ach.condition(stats)) {
              unlockAchievement(ach);
          }
      });
  };

  const unlockAchievement = (ach: Achievement) => {
      setUnlockedAchievements(prev => [...prev, ach.id]);
      setToastMessage(`Unlocked: ${ach.title}`);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const getDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'EASY': return 'text-blue-400 border-blue-400';
          case 'NORMAL': return 'text-green-400 border-green-400';
          case 'HARD': return 'text-yellow-400 border-yellow-400';
          case 'HARDER': return 'text-orange-500 border-orange-500';
          case 'INSANE': return 'text-purple-500 border-purple-500';
          case 'DEMON': return 'text-red-600 border-red-600';
          default: return 'text-white border-white';
      }
  };

  const renderGdButton = (icon: React.ReactNode, onClick: () => void, colorClass = "bg-green-500", size = "w-16 h-16") => (
    <button 
      onClick={onClick}
      className={`${size} ${colorClass} rounded-xl border-2 border-white/80 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
      <div className="relative z-10 drop-shadow-md text-white">
        {icon}
      </div>
    </button>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      
      {/* Game Canvas */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState} 
        setScore={setScore}
        setAttempts={setAttempts}
        level={gameState === GameState.EDITOR || (gameState === GameState.PLAYING && currentLevel.id === 999) ? customLevel : currentLevel}
        particleDensity={particleDensity}
        onStatsUpdate={handleStatsUpdate}
        editorTool={editorTool}
        setCustomLevelData={setCustomLevelData}
        isPracticeMode={isPracticeMode}
      />

      {/* Toast Notification */}
      {toastMessage && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-900 border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-4">
              <Trophy size={32} />
              <div>
                  <div className="font-bold text-sm uppercase text-gray-400">Achievement Unlocked</div>
                  <div className="font-black text-xl">{toastMessage}</div>
              </div>
          </div>
      )}

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        
        {/* HUD (Playing) */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-0 w-full h-20 flex flex-col justify-between p-4 pointer-events-none">
             <div className="flex justify-between items-start w-full text-white font-bold drop-shadow-md pointer-events-auto">
                 <div className="flex flex-col gap-1">
                     <div className="bg-black/40 px-3 py-1 rounded border border-white/20">Attempt {attempts}</div>
                     {isPracticeMode && (
                         <div className="bg-cyan-600/80 px-3 py-1 rounded border border-cyan-300 text-xs">PRACTICE MODE</div>
                     )}
                 </div>
                 <button 
                   onClick={() => setGameState(currentLevel.id === 999 ? GameState.EDITOR : GameState.MENU)}
                   className="bg-black/40 p-2 rounded hover:bg-white/20 transition"
                 >
                    <Menu size={20} />
                 </button>
             </div>
             <div className="w-full max-w-2xl mx-auto mt-2 bg-gray-900/80 h-3 rounded-full overflow-hidden border border-gray-600">
                <div 
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500" 
                    style={{ width: `${score}%`, transition: 'width 0.1s linear' }}
                />
            </div>
          </div>
        )}

        {/* EDITOR HUD */}
        {gameState === GameState.EDITOR && (
            <div className="absolute inset-0 pointer-events-auto flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                    <div className="bg-black/60 p-2 rounded-xl text-white font-mono text-sm border border-white/20">
                        <div>EDITOR MODE</div>
                        <div className="text-gray-400 text-xs">Left Click: Place | Mid/Right: Pan</div>
                    </div>
                    <button 
                        onClick={() => setGameState(GameState.MENU)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-red-800"
                    >
                        EXIT
                    </button>
                </div>
                
                {/* Editor Toolbar */}
                <div className="bg-black/80 backdrop-blur-md p-2 rounded-2xl border-2 border-white/20 self-center flex gap-4 mb-4">
                    <button onClick={() => setEditorTool(EntityType.BLOCK)} className={`p-3 rounded-lg border-2 ${editorTool === EntityType.BLOCK ? 'bg-green-500 border-white' : 'bg-gray-700 border-gray-900'}`}>
                        <Square className="text-white fill-white" />
                    </button>
                    <button onClick={() => setEditorTool(EntityType.SPIKE)} className={`p-3 rounded-lg border-2 ${editorTool === EntityType.SPIKE ? 'bg-green-500 border-white' : 'bg-gray-700 border-gray-900'}`}>
                        <Triangle className="text-white fill-white" />
                    </button>
                    <button onClick={() => setEditorTool(EntityType.ORB)} className={`p-3 rounded-lg border-2 ${editorTool === EntityType.ORB ? 'bg-green-500 border-white' : 'bg-gray-700 border-gray-900'}`}>
                        <Circle className="text-yellow-400" />
                    </button>
                    <div className="w-px bg-white/30 mx-2"></div>
                    <button onClick={() => setEditorTool('ERASE')} className={`p-3 rounded-lg border-2 ${editorTool === 'ERASE' ? 'bg-red-500 border-white' : 'bg-gray-700 border-gray-900'}`}>
                        <Eraser className="text-white" />
                    </button>
                    <div className="w-px bg-white/30 mx-2"></div>
                    <button onClick={() => {
                        setCurrentLevel(customLevel);
                        setIsPracticeMode(false);
                        setGameState(GameState.PLAYING);
                        setAttempts(1);
                        setScore(0);
                    }} className="p-3 rounded-lg border-2 bg-blue-500 border-blue-700 hover:bg-blue-400">
                        <Play className="text-white fill-white" />
                    </button>
                </div>
            </div>
        )}

        {/* --- MAIN MENU --- */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-auto z-10 py-6">
            <div className="w-full flex justify-between px-6 pt-4 items-start">
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-black rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                        <User className="text-black w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <span className="text-yellow-400 font-bold text-shadow-black">Somie</span>
                </div>
                <div className="relative mt-2 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 tracking-tighter"
                        style={{ WebkitTextStroke: '2px black', filter: 'drop-shadow(4px 4px 0px black)' }}>GEOMETRY</h1>
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-green-400 to-green-600 tracking-tighter"
                        style={{ WebkitTextStroke: '2px black', filter: 'drop-shadow(4px 4px 0px black)' }}>DASH</h1>
                </div>
                <div className="w-16"></div> 
            </div>

            <div className="flex items-center gap-6 md:gap-12 mt-12">
                <button className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-xl border-4 border-black/30 border-b-8 active:border-b-4 active:translate-y-1 transition-all flex items-center justify-center shadow-2xl relative overflow-hidden group">
                     <div className="w-12 h-12 bg-yellow-400 border-2 border-black"><div className="w-full h-full border-2 border-cyan-400 m-px"></div></div>
                </button>

                <button 
                    onClick={() => setGameState(GameState.LEVEL_SELECT)}
                    className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-b from-green-400 to-green-600 rounded-2xl border-4 border-black/30 border-b-8 active:border-b-4 active:translate-y-1 transition-all flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.4)] group"
                >
                    <Play className="w-20 h-20 text-yellow-300 fill-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] z-10 ml-2" />
                </button>

                <button 
                    onClick={() => setGameState(GameState.EDITOR)}
                    className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-b from-purple-400 to-purple-600 rounded-xl border-4 border-black/30 border-b-8 active:border-b-4 active:translate-y-1 transition-all flex items-center justify-center shadow-2xl group">
                     <Hammer className="w-12 h-12 text-yellow-300 fill-yellow-300 drop-shadow-md group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            <div className="w-full flex justify-between items-end px-4 pb-2">
                <div className="flex flex-col gap-2">
                    <button className="w-10 h-10 bg-blue-600 rounded border border-white flex items-center justify-center text-white"><Facebook size={20}/></button>
                    <button className="w-10 h-10 bg-sky-500 rounded border border-white flex items-center justify-center text-white"><Twitter size={20}/></button>
                    <button className="w-10 h-10 bg-red-600 rounded border border-white flex items-center justify-center text-white"><Youtube size={20}/></button>
                </div>
                
                <div className="flex gap-4 mb-2 mx-auto">
                    {renderGdButton(<Trophy size={32} fill="gold" className="text-yellow-600" />, () => setShowAchievements(true), "bg-gradient-to-b from-yellow-400 to-orange-500", "w-16 h-16 rounded-full border-4 border-gray-300")}
                    {renderGdButton(<Settings size={32} className="text-cyan-900 animate-spin-slow" />, () => setShowSettings(true), "bg-gradient-to-b from-cyan-400 to-blue-500", "w-16 h-16 rounded-full border-4 border-gray-300")}
                    {renderGdButton(<BarChart2 size={32} className="text-green-900" />, () => {}, "bg-gradient-to-b from-green-400 to-emerald-600", "w-16 h-16 rounded-full border-4 border-gray-300")}
                </div>

                <div className="w-24 h-24 bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl border-2 border-white flex flex-col items-center justify-center shadow-lg">
                    <span className="font-black text-yellow-300 text-shadow-black text-lg leading-none">MORE</span>
                    <span className="font-black text-white text-shadow-black text-lg leading-none">GAMES</span>
                </div>
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-30 pointer-events-auto animate-in fade-in">
                <div className="bg-[#1a1a1a] rounded-3xl border-4 border-yellow-500 shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[80vh]">
                     <div className="bg-gradient-to-b from-orange-600 to-yellow-600 p-4 rounded-t-[20px] flex justify-between items-center border-b-4 border-black/20">
                         <h2 className="text-3xl font-black text-white uppercase drop-shadow-md">Achievements</h2>
                         <button onClick={() => setShowAchievements(false)} className="bg-red-500 rounded-lg p-2 text-white border-2 border-white/20"><X/></button>
                     </div>
                     <div className="p-6 overflow-y-auto space-y-4">
                         {ACHIEVEMENTS.map(ach => {
                             const unlocked = unlockedAchievements.includes(ach.id);
                             return (
                                 <div key={ach.id} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${unlocked ? 'bg-green-900/40 border-green-500' : 'bg-black/40 border-white/10 grayscale opacity-70'}`}>
                                     <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-white' : 'bg-gray-700 border-gray-600'}`}>
                                         <Trophy className={unlocked ? 'text-white fill-yellow-200' : 'text-gray-500'} />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className={`font-black text-xl uppercase ${unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>{ach.title}</h3>
                                         <p className="text-white font-bold">{ach.description}</p>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                </div>
            </div>
        )}

        {/* Level Select */}
        {gameState === GameState.LEVEL_SELECT && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950 pointer-events-auto z-10">
            <div className="flex w-full items-center justify-between px-8 mb-4 z-10 pt-4">
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="w-16 h-16 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:scale-105 transition"
                >
                  <ChevronLeft size={40} className="text-white ml-[-4px]" strokeWidth={3} />
                </button>
                <h2 className="text-4xl font-black text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)] uppercase tracking-wider">Select Level</h2>
                <div className="w-16"></div> 
            </div>
            
            <div className="w-full max-w-6xl overflow-x-auto px-12 py-8 flex gap-12 snap-x no-scrollbar z-10 items-center justify-start md:justify-center">
              {LEVELS.map((level) => {
                  const diffColors = getDifficultyColor(level.difficulty);
                  const isSelected = currentLevel.id === level.id;
                  const progress = gameStats.levelProgress[level.id] || 0;
                  const isCompleted = progress === 100;
                  
                  return (
                    <div 
                      key={level.id}
                      className={`relative group w-72 h-[26rem] flex-shrink-0 bg-black/80 rounded-2xl border-4 transform transition-all duration-300 snap-center overflow-hidden flex flex-col
                        ${diffColors.split(' ')[1]}
                        ${isSelected ? 'scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'opacity-90'}
                      `}
                    >
                      <div 
                        className="h-1/2 w-full bg-cover bg-center relative border-b-4 border-black/20"
                        style={{ backgroundColor: level.theme.background }}
                      >
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-8xl font-black text-black/20 italic">{level.id}</span>
                         </div>
                         {isCompleted && (
                             <div className="absolute top-2 right-2">
                                 <Star className="text-yellow-400 fill-yellow-400 drop-shadow-lg" size={32}/>
                             </div>
                         )}
                      </div>
                      
                      <div className="flex-1 p-2 flex flex-col items-center justify-between bg-gray-900 border-t-2 border-white/10 relative">
                        <div className="text-center">
                            <h3 className="text-white font-black text-2xl truncate uppercase tracking-tighter text-shadow-black">{level.name}</h3>
                            <div className={`inline-block px-3 py-0.5 rounded-full text-xs font-black border bg-black/50 ${diffColors} uppercase mt-1`}>
                                {level.difficulty}
                            </div>
                        </div>

                        {/* Progress Bar */}
                         <div className="w-full px-4 mb-2">
                            <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                                <span>Normal Mode</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-black h-3 rounded-full border border-gray-700 overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mb-2">
                             <button 
                                onClick={() => {
                                    setCurrentLevel(level);
                                    setIsPracticeMode(false);
                                    setGameState(GameState.PLAYING);
                                    setAttempts(1);
                                    setScore(0);
                                }}
                                className="w-14 h-14 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg hover:scale-110 transition active:scale-95"
                                title="Play Normal Mode"
                             >
                                 <Play className="text-white ml-1 fill-white" size={24} />
                             </button>

                             <button 
                                onClick={() => {
                                    setCurrentLevel(level);
                                    setIsPracticeMode(true);
                                    setGameState(GameState.PLAYING);
                                    setAttempts(1);
                                    setScore(0);
                                }}
                                className="w-14 h-14 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg hover:scale-110 transition active:scale-95"
                                title="Practice Mode"
                             >
                                 <Diamond className="text-white fill-cyan-200" size={24} />
                             </button>
                        </div>

                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {gameState === GameState.VICTORY && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-auto z-20 animate-in zoom-in duration-300">
             <div className="bg-gradient-to-br from-yellow-300 to-orange-500 p-8 rounded-full mb-6 border-4 border-white shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                <Trophy size={80} className="text-white drop-shadow-md" />
             </div>
             <h2 className="text-6xl font-black text-white mb-2 italic drop-shadow-[4px_4px_0_rgba(0,0,0,1)] stroke-black" style={{WebkitTextStroke: '2px black'}}>LEVEL COMPLETE!</h2>
             
             <div className="flex gap-6 mt-8">
                <button 
                  onClick={() => {
                      if (currentLevel.id === 999) setGameState(GameState.EDITOR);
                      else setGameState(GameState.LEVEL_SELECT);
                      setScore(0);
                  }}
                  className="w-20 h-20 bg-blue-500 rounded-xl border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition"
                >
                  <Menu size={32} className="text-white" />
                </button>
                <button 
                  onClick={() => {
                      setGameState(GameState.PLAYING);
                      setScore(0);
                      setAttempts(prev => prev + 1);
                  }}
                  className="w-24 h-24 bg-green-500 rounded-xl border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition"
                >
                  <RotateCcw size={40} className="text-white" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;