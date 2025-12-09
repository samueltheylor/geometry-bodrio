import { EntityType, LevelObject, Level, Achievement } from './types';

// Physics (Adjusted for GD-like feel)
export const GRAVITY = 1.3; 
export const JUMP_FORCE = 19.5; 
export const MOVE_SPEED = 7.0; 
export const TERMINAL_VELOCITY = 20;
export const ROTATION_SPEED = 0.18; 

// Dimensions (Grid based)
export const TILE_SIZE = 50;
export const PLAYER_SIZE = 40;

// Helper to push objects
const createLevelData = (pattern: (add: (t: EntityType, x: number, y?: number) => void) => void): LevelObject[] => {
  const objects: LevelObject[] = [];
  let id = 0;
  const add = (type: EntityType, xGrid: number, yGrid: number = 0) => {
    objects.push({
      id: id++,
      type,
      x: xGrid * TILE_SIZE,
      y: yGrid * TILE_SIZE
    });
  };
  pattern(add);
  return objects;
};

// --- ACHIEVEMENTS ---
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_jump',
    title: 'Hop to It',
    description: 'Jump 10 times.',
    icon: 'activity',
    condition: (stats) => stats.totalJumps >= 10
  },
  {
    id: 'dedication',
    title: 'Dedication',
    description: 'Die 50 times. Keep trying!',
    icon: 'skull',
    condition: (stats) => stats.totalDeaths >= 50
  },
  {
    id: 'air_master',
    title: 'Air Master',
    description: 'Jump 500 times total.',
    icon: 'wind',
    condition: (stats) => stats.totalJumps >= 500
  },
  {
    id: 'getting_started',
    title: 'Stereo Madness',
    description: 'Complete Level 1.',
    icon: 'check',
    condition: (stats) => (stats.levelProgress[1] || 0) >= 100
  },
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Reach 100 attempts total.',
    icon: 'shield',
    condition: (stats) => stats.totalAttempts >= 100
  }
];

// --- LEVELS ---

const Level1Data = createLevelData((add) => {
  add(EntityType.SPIKE, 8);
  add(EntityType.SPIKE, 15);
  add(EntityType.BLOCK, 18);
  add(EntityType.BLOCK, 19);
  add(EntityType.BLOCK, 25);
  add(EntityType.SPIKE, 28);
  add(EntityType.BLOCK, 32);
  add(EntityType.BLOCK, 33, 1);
  add(EntityType.BLOCK, 38, 1);
  add(EntityType.ORB, 41, 3); 
  add(EntityType.BLOCK, 44, 2);
  add(EntityType.SPIKE, 40); 
  add(EntityType.SPIKE, 41); 
  add(EntityType.BLOCK, 48);
  add(EntityType.BLOCK, 49);
  add(EntityType.SPIKE, 49, 1);
  add(EntityType.BLOCK, 55);
  add(EntityType.BLOCK, 56, 1);
  add(EntityType.BLOCK, 57, 2);
  add(EntityType.BLOCK, 60, 2);
  add(EntityType.BLOCK, 61, 1);
  add(EntityType.BLOCK, 62, 0);
  add(EntityType.SPIKE, 70);
  add(EntityType.SPIKE, 73);
  add(EntityType.SPIKE, 76);
  for(let i=0; i<5; i++) add(EntityType.BLOCK, 85+i);
});

const Level2Data = createLevelData((add) => {
  add(EntityType.SPIKE, 10);
  add(EntityType.BLOCK, 14);
  add(EntityType.SPIKE, 14, 1); 
  add(EntityType.BLOCK, 20, 1);
  add(EntityType.BLOCK, 21, 1);
  add(EntityType.BLOCK, 24, 2);
  add(EntityType.ORB, 27, 3);
  add(EntityType.BLOCK, 30, 2);
  add(EntityType.SPIKE, 30);
  add(EntityType.SPIKE, 31);
  add(EntityType.SPIKE, 32);
  add(EntityType.BLOCK, 40);
  add(EntityType.BLOCK, 41, 1);
  add(EntityType.BLOCK, 42, 2);
  add(EntityType.BLOCK, 44, 2);
  add(EntityType.SPIKE, 46);
  add(EntityType.BLOCK, 48, 1);
  add(EntityType.SPIKE, 55);
  add(EntityType.BLOCK, 58);
  add(EntityType.ORB, 61, 2);
  add(EntityType.BLOCK, 64);
  for(let i=0; i<5; i++) add(EntityType.BLOCK, 80+i);
});

const Level3Data = createLevelData((add) => {
  add(EntityType.SPIKE, 8);
  add(EntityType.SPIKE, 9);
  add(EntityType.BLOCK, 15);
  add(EntityType.SPIKE, 18);
  add(EntityType.BLOCK, 25);
  add(EntityType.BLOCK, 25, 2); 
  add(EntityType.BLOCK, 26);
  add(EntityType.BLOCK, 26, 2);
  add(EntityType.SPIKE, 28);
  for(let i=0; i<5; i++) {
      add(EntityType.BLOCK, 35+i, i);
  }
  add(EntityType.ORB, 42, 4);
  add(EntityType.SPIKE, 42);
  add(EntityType.SPIKE, 43);
  add(EntityType.SPIKE, 44);
  add(EntityType.ORB, 45, 3);
  add(EntityType.BLOCK, 50, 0);
  add(EntityType.BLOCK, 53, 0);
  add(EntityType.BLOCK, 56, 0);
  add(EntityType.SPIKE, 51);
  add(EntityType.SPIKE, 54);
  for(let i=0; i<5; i++) add(EntityType.BLOCK, 70+i);
});

const Level4Data = createLevelData((add) => {
    add(EntityType.SPIKE, 10);
    add(EntityType.BLOCK, 10, 2); 
    add(EntityType.BLOCK, 15);
    add(EntityType.BLOCK, 16);
    add(EntityType.SPIKE, 16, 1);
    add(EntityType.BLOCK, 22, 1);
    add(EntityType.BLOCK, 25, 2);
    add(EntityType.ORB, 28, 4);
    add(EntityType.SPIKE, 35);
    add(EntityType.SPIKE, 36);
    add(EntityType.SPIKE, 37);
    add(EntityType.BLOCK, 45, 1);
    add(EntityType.BLOCK, 46, 2);
    add(EntityType.BLOCK, 47, 3);
    add(EntityType.ORB, 49, 4);
    add(EntityType.BLOCK, 51, 3);
    add(EntityType.BLOCK, 53, 2);
    add(EntityType.SPIKE, 56);
    add(EntityType.SPIKE, 59);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 80+i);
});

const Level5Data = createLevelData((add) => {
    add(EntityType.SPIKE, 10);
    add(EntityType.SPIKE, 11);
    add(EntityType.BLOCK, 15);
    add(EntityType.SPIKE, 18);
    add(EntityType.BLOCK, 21);
    add(EntityType.SPIKE, 24);
    for(let i=0; i<4; i++) {
        add(EntityType.BLOCK, 30+i, i);
    }
    for(let i=0; i<4; i++) {
        add(EntityType.BLOCK, 34+i, 3-i);
    }
    add(EntityType.ORB, 40, 2);
    add(EntityType.ORB, 42, 3);
    add(EntityType.ORB, 44, 2);
    add(EntityType.SPIKE, 42);
    add(EntityType.BLOCK, 48);
    add(EntityType.BLOCK, 48, 2);
    add(EntityType.BLOCK, 49);
    add(EntityType.BLOCK, 49, 2);
    add(EntityType.SPIKE, 50);
    add(EntityType.BLOCK, 55, 2);
    add(EntityType.SPIKE, 55, 0);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 80+i);
});

const Level6Data = createLevelData((add) => {
    // DEMON CORE
    add(EntityType.SPIKE, 10);
    add(EntityType.SPIKE, 11);
    add(EntityType.SPIKE, 12); // Triple spike
    
    add(EntityType.BLOCK, 15, 1);
    add(EntityType.BLOCK, 18, 2);
    add(EntityType.ORB, 20, 4);
    
    add(EntityType.SPIKE, 23, 0);
    add(EntityType.SPIKE, 24, 0);
    
    // Tight gap
    add(EntityType.BLOCK, 30, 0);
    add(EntityType.BLOCK, 30, 2);
    add(EntityType.BLOCK, 31, 0);
    add(EntityType.BLOCK, 31, 2);
    
    // Sawtooth
    add(EntityType.SPIKE, 35, 0);
    add(EntityType.ORB, 36, 2);
    add(EntityType.SPIKE, 37, 0);
    add(EntityType.ORB, 38, 2);
    add(EntityType.SPIKE, 39, 0);
    
    // Tower climb
    add(EntityType.BLOCK, 45, 0);
    add(EntityType.BLOCK, 46, 1);
    add(EntityType.BLOCK, 47, 2);
    add(EntityType.BLOCK, 48, 3);
    add(EntityType.ORB, 50, 4);
    add(EntityType.BLOCK, 53, 3);
    add(EntityType.BLOCK, 54, 2);
    
    // Ending Maze
    add(EntityType.BLOCK, 60, 1);
    add(EntityType.SPIKE, 60, 2);
    add(EntityType.BLOCK, 62, 1);
    add(EntityType.SPIKE, 62, 0);
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 85+i);
});

// NEW LEVELS

const Level7Data = createLevelData((add) => {
    // PAD INTRO
    add(EntityType.PAD, 8);
    add(EntityType.BLOCK, 12, 3);
    add(EntityType.PAD, 15);
    add(EntityType.BLOCK, 19, 3);
    add(EntityType.SPIKE, 19, 4); // Roof spike? No, sits on top
    add(EntityType.BLOCK, 22, 1);
    add(EntityType.PAD, 24);
    add(EntityType.ORB, 27, 4);
    add(EntityType.BLOCK, 30, 2);
    add(EntityType.PAD, 35);
    add(EntityType.PAD, 40);
    add(EntityType.BLOCK, 45, 4);
    add(EntityType.SPIKE, 48);
    add(EntityType.SPIKE, 49);
    add(EntityType.PAD, 55);
    add(EntityType.ORB, 60, 5);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 70+i);
});

const Level8Data = createLevelData((add) => {
    // TIME MACHINE VIBES (ORBS)
    add(EntityType.SPIKE, 8);
    add(EntityType.ORB, 10, 2);
    add(EntityType.ORB, 12, 2);
    add(EntityType.BLOCK, 15);
    add(EntityType.SPIKE, 18);
    add(EntityType.PAD, 20);
    add(EntityType.BLOCK, 24, 3);
    add(EntityType.BLOCK, 25, 3);
    add(EntityType.SPIKE, 25, 4);
    add(EntityType.ORB, 28, 2);
    add(EntityType.ORB, 30, 1);
    add(EntityType.ORB, 32, 2);
    add(EntityType.BLOCK, 35, 1);
    add(EntityType.PAD, 38);
    add(EntityType.BLOCK, 42, 4);
    add(EntityType.SPIKE, 45);
    add(EntityType.SPIKE, 46);
    add(EntityType.ORB, 50, 3);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 65+i);
});

const Level9Data = createLevelData((add) => {
    // CYCLES (STAIRS)
    add(EntityType.BLOCK, 8);
    add(EntityType.BLOCK, 9, 1);
    add(EntityType.BLOCK, 10, 2);
    add(EntityType.BLOCK, 11, 1);
    add(EntityType.BLOCK, 12, 0);
    add(EntityType.SPIKE, 15);
    add(EntityType.PAD, 18);
    add(EntityType.BLOCK, 22, 2);
    add(EntityType.SPIKE, 22, 3);
    add(EntityType.BLOCK, 26, 1);
    add(EntityType.PAD, 28);
    add(EntityType.BLOCK, 32, 3);
    add(EntityType.BLOCK, 33, 2);
    add(EntityType.BLOCK, 34, 1);
    add(EntityType.SPIKE, 38);
    add(EntityType.ORB, 40, 3);
    add(EntityType.ORB, 42, 3);
    add(EntityType.PAD, 45);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level10Data = createLevelData((add) => {
    // XSTEP (GAPS)
    add(EntityType.BLOCK, 8);
    add(EntityType.SPIKE, 9); 
    add(EntityType.BLOCK, 10);
    add(EntityType.SPIKE, 11);
    add(EntityType.BLOCK, 12);
    
    add(EntityType.PAD, 15);
    add(EntityType.BLOCK, 19, 3);
    add(EntityType.ORB, 21, 5);
    add(EntityType.BLOCK, 24, 3);
    
    add(EntityType.SPIKE, 28);
    add(EntityType.SPIKE, 29);
    add(EntityType.ORB, 31, 2);
    add(EntityType.BLOCK, 35);
    add(EntityType.PAD, 38);
    add(EntityType.ORB, 42, 5);
    
    add(EntityType.BLOCK, 45, 1);
    add(EntityType.SPIKE, 45, 2);
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level11Data = createLevelData((add) => {
    // CLUTTERFUNK (NARROW)
    add(EntityType.BLOCK, 10);
    add(EntityType.BLOCK, 10, 2); // Gap
    add(EntityType.SPIKE, 14);
    add(EntityType.BLOCK, 15, 1);
    add(EntityType.BLOCK, 16, 2);
    add(EntityType.SPIKE, 18);
    
    add(EntityType.PAD, 22);
    add(EntityType.BLOCK, 26, 3);
    add(EntityType.BLOCK, 27, 2);
    add(EntityType.BLOCK, 28, 3);
    add(EntityType.ORB, 30, 5);
    
    add(EntityType.BLOCK, 35, 1);
    add(EntityType.SPIKE, 38);
    add(EntityType.SPIKE, 39);
    add(EntityType.SPIKE, 40);
    add(EntityType.PAD, 45);
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level12Data = createLevelData((add) => {
    // TOE (MIXED)
    add(EntityType.PAD, 8);
    add(EntityType.ORB, 11, 4);
    add(EntityType.ORB, 13, 3);
    add(EntityType.BLOCK, 16, 1);
    add(EntityType.SPIKE, 18);
    add(EntityType.BLOCK, 20);
    add(EntityType.BLOCK, 21, 1);
    add(EntityType.BLOCK, 22, 2);
    add(EntityType.PAD, 25);
    add(EntityType.BLOCK, 30, 4);
    add(EntityType.SPIKE, 30, 5);
    add(EntityType.ORB, 33, 2);
    add(EntityType.BLOCK, 36, 1);
    add(EntityType.SPIKE, 40);
    add(EntityType.PAD, 42);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level13Data = createLevelData((add) => {
    // ELECTROMAN (SPEED ILLUSION)
    // Lots of deco blocks
    for(let i=0; i<10; i+=2) add(EntityType.BLOCK, 5+i, 4); 
    
    add(EntityType.SPIKE, 10);
    add(EntityType.BLOCK, 15);
    add(EntityType.PAD, 18);
    add(EntityType.BLOCK, 22, 3);
    add(EntityType.BLOCK, 25);
    add(EntityType.SPIKE, 28);
    add(EntityType.SPIKE, 29);
    add(EntityType.PAD, 32);
    add(EntityType.ORB, 35, 4);
    add(EntityType.ORB, 37, 3);
    add(EntityType.ORB, 39, 2);
    add(EntityType.BLOCK, 45, 1);
    add(EntityType.SPIKE, 48);
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level14Data = createLevelData((add) => {
    // CLUBSTEP (DEMON 2)
    add(EntityType.SPIKE, 10);
    add(EntityType.SPIKE, 11);
    add(EntityType.SPIKE, 12); // Triple
    
    add(EntityType.BLOCK, 15, 1);
    add(EntityType.SPIKE, 15, 2); // Head hitter
    
    add(EntityType.PAD, 18);
    add(EntityType.SPIKE, 22, 3); // Air spike
    
    add(EntityType.BLOCK, 25, 0);
    add(EntityType.BLOCK, 25, 2); // Tight gap
    add(EntityType.SPIKE, 28);
    add(EntityType.SPIKE, 29);
    
    add(EntityType.ORB, 32, 2);
    add(EntityType.ORB, 34, 3);
    add(EntityType.ORB, 36, 1); // Tricky sequence
    
    add(EntityType.BLOCK, 40, 2);
    add(EntityType.PAD, 45);
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level15Data = createLevelData((add) => {
    // ELECTRODYNAMIX (FAST)
    add(EntityType.PAD, 8);
    add(EntityType.PAD, 12);
    add(EntityType.PAD, 16); // Speed ramping feel
    
    add(EntityType.BLOCK, 20, 1);
    add(EntityType.SPIKE, 23);
    add(EntityType.BLOCK, 26, 2);
    add(EntityType.ORB, 29, 4);
    
    add(EntityType.BLOCK, 33, 1);
    add(EntityType.BLOCK, 33, 3);
    add(EntityType.SPIKE, 36);
    add(EntityType.PAD, 40);
    add(EntityType.BLOCK, 45, 4);
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});

const Level16Data = createLevelData((add) => {
    // HEXAGON FORCE (DUAL SIM)
    add(EntityType.BLOCK, 10);
    add(EntityType.BLOCK, 10, 3); // Simulates dual paths visual
    add(EntityType.SPIKE, 13);
    
    add(EntityType.PAD, 16);
    add(EntityType.BLOCK, 20, 2);
    add(EntityType.ORB, 23, 4);
    
    add(EntityType.BLOCK, 26);
    add(EntityType.BLOCK, 26, 3);
    
    add(EntityType.SPIKE, 30);
    add(EntityType.SPIKE, 31);
    add(EntityType.ORB, 33, 2);
    add(EntityType.PAD, 36);
    
    add(EntityType.BLOCK, 40, 1);
    add(EntityType.BLOCK, 40, 4); // Head hitter check
    
    for(let i=0; i<5; i++) add(EntityType.BLOCK, 60+i);
});


export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Stereo Start",
    difficulty: "EASY",
    bpm: 130,
    length: 90 * TILE_SIZE,
    data: Level1Data,
    theme: {
      background: '#203a96', 
      floor: '#102060',
      objPrimary: '#00ccff',
      objSecondary: '#005588',
      spike: '#111111'
    }
  },
  {
    id: 2,
    name: "Polargeist Mix",
    difficulty: "NORMAL",
    bpm: 145,
    length: 85 * TILE_SIZE,
    data: Level2Data,
    theme: {
      background: '#228B22', 
      floor: '#006400',
      objPrimary: '#90EE90',
      objSecondary: '#004d00',
      spike: '#111111'
    }
  },
  {
    id: 3,
    name: "Red Zone",
    difficulty: "HARD",
    bpm: 160,
    length: 80 * TILE_SIZE,
    data: Level3Data,
    theme: {
      background: '#8B0000',
      floor: '#400000',
      objPrimary: '#ff4444',
      objSecondary: '#660000',
      spike: '#111111'
    }
  },
  {
    id: 4,
    name: "Dry Out Logic",
    difficulty: "HARDER",
    bpm: 150,
    length: 95 * TILE_SIZE,
    data: Level4Data,
    theme: {
        background: '#4B0082',
        floor: '#2e0052',
        objPrimary: '#DA70D6', 
        objSecondary: '#800080',
        spike: '#000000'
    }
  },
  {
    id: 5,
    name: "Base After Base",
    difficulty: "INSANE",
    bpm: 165,
    length: 100 * TILE_SIZE,
    data: Level5Data,
    theme: {
        background: '#1a1a1a', 
        floor: '#000000',
        objPrimary: '#ff0000',
        objSecondary: '#400000',
        spike: '#ff0000'
    }
  },
  {
    id: 6,
    name: "DEMON CORE",
    difficulty: "DEMON",
    bpm: 180,
    length: 110 * TILE_SIZE,
    data: Level6Data,
    theme: {
        background: '#330000',
        floor: '#110000',
        objPrimary: '#660000',
        objSecondary: '#330000',
        spike: '#ff0000'
    }
  },
  {
    id: 7,
    name: "Jumper High",
    difficulty: "HARDER",
    bpm: 145,
    length: 90 * TILE_SIZE,
    data: Level7Data,
    theme: {
        background: '#D4AF37', // Gold
        floor: '#8B8000',
        objPrimary: '#FFFF00',
        objSecondary: '#DAA520',
        spike: '#000000'
    }
  },
  {
    id: 8,
    name: "Time Traveler",
    difficulty: "HARDER",
    bpm: 150,
    length: 95 * TILE_SIZE,
    data: Level8Data,
    theme: {
        background: '#FF1493', // Deep Pink
        floor: '#8B008B',
        objPrimary: '#FF69B4',
        objSecondary: '#C71585',
        spike: '#222222'
    }
  },
  {
    id: 9,
    name: "Cycles Repeat",
    difficulty: "HARD",
    bpm: 140,
    length: 90 * TILE_SIZE,
    data: Level9Data,
    theme: {
        background: '#008080', // Teal
        floor: '#004d4d',
        objPrimary: '#40E0D0',
        objSecondary: '#008B8B',
        spike: '#000000'
    }
  },
  {
    id: 10,
    name: "xStep Forward",
    difficulty: "INSANE",
    bpm: 160,
    length: 100 * TILE_SIZE,
    data: Level10Data,
    theme: {
        background: '#00008B', // Dark Blue
        floor: '#000040',
        objPrimary: '#4169E1',
        objSecondary: '#0000CD',
        spike: '#FFFFFF'
    }
  },
  {
    id: 11,
    name: "Clutter Funk",
    difficulty: "INSANE",
    bpm: 165,
    length: 105 * TILE_SIZE,
    data: Level11Data,
    theme: {
        background: '#2F4F4F', // Dark Slate Gray
        floor: '#1A2b2b',
        objPrimary: '#708090',
        objSecondary: '#2F4F4F',
        spike: '#FF4500' // Orange spikes
    }
  },
  {
    id: 12,
    name: "Theory of Everything",
    difficulty: "INSANE",
    bpm: 155,
    length: 100 * TILE_SIZE,
    data: Level12Data,
    theme: {
        background: '#556B2F', // Dark Olive Green
        floor: '#2E3B19',
        objPrimary: '#9ACD32',
        objSecondary: '#6B8E23',
        spike: '#000000'
    }
  },
  {
    id: 13,
    name: "Electroman",
    difficulty: "INSANE",
    bpm: 170,
    length: 110 * TILE_SIZE,
    data: Level13Data,
    theme: {
        background: '#9400D3', // Dark Violet
        floor: '#4B0082',
        objPrimary: '#E6E6FA',
        objSecondary: '#8A2BE2',
        spike: '#000000'
    }
  },
  {
    id: 14,
    name: "Clubstep Demon",
    difficulty: "DEMON",
    bpm: 180,
    length: 120 * TILE_SIZE,
    data: Level14Data,
    theme: {
        background: '#0a0a0a', // Almost black
        floor: '#300000',
        objPrimary: '#800000',
        objSecondary: '#000000',
        spike: '#FF0000'
    }
  },
  {
    id: 15,
    name: "Electro Dynamics",
    difficulty: "DEMON",
    bpm: 190,
    length: 125 * TILE_SIZE,
    data: Level15Data,
    theme: {
        background: '#FF4500', // Orange Red
        floor: '#8B0000',
        objPrimary: '#FFA500',
        objSecondary: '#FF8C00',
        spike: '#000000'
    }
  },
  {
    id: 16,
    name: "Hexagon Force",
    difficulty: "DEMON",
    bpm: 175,
    length: 130 * TILE_SIZE,
    data: Level16Data,
    theme: {
        background: '#483D8B', // Dark Slate Blue
        floor: '#191970',
        objPrimary: '#7B68EE',
        objSecondary: '#6A5ACD',
        spike: '#000000'
    }
  }
];

export const PLAYER_COLOR = {
    primary: '#FFFF00', 
    secondary: '#00FFFF', 
    border: '#000000'
};