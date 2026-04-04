export interface NarrBlock {
  loc: string;
  lines: string[];
}

export interface CodeDropPair {
  comp: string;
  service: string;
}

export interface MemoryPairRow {
  emoji: string;
  label: string;
  description: string;
}

export interface EscapeRoomContent {
  intro: NarrBlock;
  roomScene: {
    sealedDoor: NarrBlock;
    lockedMainframe: NarrBlock;
    corridorB: NarrBlock;
    mainframeRestricted: NarrBlock;
    terminalSolved: { lines: string[] };
  };
  codeDrop: {
    pairs: CodeDropPair[];
    ui: {
      idle: string;
      overloadTitle: string;
      overloadRetry: string;
      winTitle: string;
    };
  };
  debugRunner: {
    valid: string[];
    invalid: string[];
    ui: {
      idle: string;
      winTitle: string;
      loseTitle: string;
      loseRetry: string;
    };
  };
  memoryGame: {
    pairs: MemoryPairRow[];
  };
}
